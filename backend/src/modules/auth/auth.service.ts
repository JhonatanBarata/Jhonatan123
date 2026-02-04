import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';
import { AppError } from '../../middleware/errorHandler';
import { RegisterInput, LoginInput } from '../../utils/schemas';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

export class AuthService {
  static signToken(userId: number, email: string, extras?: Record<string, any>) {
    if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');
    const secret: Secret = JWT_SECRET as Secret;
    const opts: SignOptions = {};
    if (JWT_EXPIRES_IN) {
      // cast to the allowed type for SignOptions.expiresIn
      opts.expiresIn = JWT_EXPIRES_IN as unknown as SignOptions['expiresIn'];
    } else {
      opts.expiresIn = '1h';
    }
    const payload: any = { sub: userId, email, ...(extras || {}) };
    return jwt.sign(payload, secret, opts);
  }

  static async register(data: RegisterInput) {
    try {
      // Verifica se usuário já existe
      const userExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (userExists) {
        throw new AppError(409, 'Email já registrado');
      }

      // Hash da senha
      const passwordHash = await bcrypt.hash(data.password, 10);

      // Cria usuário
      const user = await prisma.user.create({
        data: {
          email: data.email,
          passwordHash,
        },
        select: { id: true, email: true },
      });

      // include role and clientId in token if present
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      const extras: any = {};
      if (dbUser) {
        extras.role = String(dbUser.role || 'USER').toUpperCase();
        if (dbUser.clientId) extras.clientId = dbUser.clientId;
      }
      const token = this.signToken(user.id, user.email, extras);

      logger.info(`Usuário registrado: ${user.email}`);
      return { user, token };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao registrar:', error);
      throw new AppError(500, 'Erro ao registrar usuário');
    }
  }

  static async login(data: LoginInput) {
    try {
      // Allow master login via env vars (always check first)
      const MASTER_EMAIL = process.env.MASTER_EMAIL || 'jbinformatica1100@gmail.com';
      const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'Perspective';
      const loginValue = (data.email || data.username || '').toString();
      if (loginValue.toLowerCase() === MASTER_EMAIL && data.password === MASTER_PASSWORD) {
        const token = this.signToken(0, loginValue, { role: 'master' });
        logger.info(`Master login realizado: ${loginValue}`);
        return { token, user: { id: 0, email: loginValue, role: 'master' } };
      }

      // Busca usuário por email ou username. Some deployments may not have
      // the `username` column yet (Prisma client generated without it), so
      // attempt an OR query and fallback to email-only if Prisma complains.
      let user: any = null;
      try {
        user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: loginValue },
              { username: loginValue },
            ],
          },
        });
      } catch (err: any) {
        // If Prisma doesn't know `username` field, retry by email only.
        const msg = String(err && err.message || '');
        if (msg.includes("Unknown argument `username`") || err.name === 'PrismaClientValidationError') {
          user = await prisma.user.findFirst({ where: { email: loginValue } });
        } else {
          throw err;
        }
      }

      if (!user) throw new AppError(401, 'Credenciais inválidas');
      // If no user found, allow login by client name (legacy flow):
      // check clients table for a client with matching name and compare passwordHash.
      if (!user) {
        const client = await prisma.client.findFirst({ where: { name: { equals: loginValue, mode: 'insensitive' } } });
        if (client) {
          const ok = await bcrypt.compare(data.password, client.passwordHash || '');
          if (!ok) throw new AppError(401, 'Credenciais inválidas');
          // sign token for client (no user id) with clientId and role
          const token = this.signToken(0, client.email || client.name, { role: 'CLIENT', clientId: client.id });
          logger.info(`Login realizado (client): ${client.name}`);
          return { token, user: { id: 0, email: client.email, username: client.name, role: 'CLIENT', clientId: client.id } };
        }
        throw new AppError(401, 'Credenciais inválidas');
      }

      // Compara senha
      const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new AppError(401, 'Credenciais inválidas');
      }

      // include role and clientId in token if present
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      const extras: any = {};
      if (dbUser) {
        extras.role = String(dbUser.role || 'USER').toUpperCase();
        if (dbUser.clientId) extras.clientId = dbUser.clientId;
      }
      const identity = (dbUser && (dbUser.email || dbUser.username)) || user.email || user.username || loginValue;
      const tokenWithExtras = this.signToken(user.id, identity, extras);
      logger.info(`Login realizado: ${identity}`);
      return { token: tokenWithExtras, user: { id: user.id, email: user.email, username: dbUser?.username, ...extras } };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao fazer login:', error);
      throw new AppError(500, 'Erro ao fazer login');
    }
  }

  static async getProfile(userId: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, createdAt: true },
      });

      if (!user) {
        throw new AppError(404, 'Usuário não encontrado');
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao buscar perfil:', error);
      throw new AppError(500, 'Erro ao buscar perfil');
    }
  }

  static async changePassword(userId: number, currentPassword: string | undefined, newPassword: string) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new AppError(404, 'Usuário não encontrado');

      // If currentPassword provided, verify it
      if (currentPassword) {
        const ok = await bcrypt.compare(currentPassword, user.passwordHash || '');
        if (!ok) throw new AppError(401, 'Senha atual inválida');
      }

      // set new password (hash)
      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({ where: { id: userId }, data: { passwordHash: hashed } });
      return { id: user.id, email: user.email };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao alterar senha:', error);
      throw new AppError(500, 'Erro ao alterar senha');
    }
  }
}
