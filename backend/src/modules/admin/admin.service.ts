import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';
import { AppError } from '../../middleware/errorHandler';

export class AdminService {
  static async listPlans() {
    try {
      return await prisma.plan.findMany({ orderBy: { id: 'asc' } });
    } catch (err) {
      logger.error('Erro ao listar planos', err);
      throw new AppError(500, 'Erro ao listar planos');
    }
  }

  static async createPlan(name: string, features: any, defaultPlan = false) {
    try {
      const plan = await prisma.plan.create({ data: { name, features, defaultPlan } });
      return plan;
    } catch (err) {
      logger.error('Erro ao criar plano', err);
      throw new AppError(500, 'Erro ao criar plano');
    }
  }

  static async updatePlan(id: number, data: any) {
    try {
      const plan = await prisma.plan.update({ where: { id }, data });
      return plan;
    } catch (err) {
      logger.error('Erro ao atualizar plano', err);
      throw new AppError(500, 'Erro ao atualizar plano');
    }
  }

  static async listClients() {
    try {
      return await prisma.client.findMany({ include: { plan: true, products: true } });
    } catch (err) {
      logger.error('Erro ao listar clientes', err);
      throw new AppError(500, 'Erro ao listar clientes');
    }
  }

  static async createClient(data: any) {
    try {
      // resolve plan by name if provided
      let planId = data.planId;
      if (data.planName) {
        const p = await prisma.plan.findUnique({ where: { name: data.planName } });
        if (!p) throw new AppError(404, 'Plano não encontrado');
        planId = p.id;
      }

      // hash password if provided
      let passwordHash = undefined;
      if (data.password) {
        const bcrypt = await import('bcryptjs');
        passwordHash = await bcrypt.hash(data.password, 10);
      }

      const client = await prisma.client.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          passwordHash,
          planId,
        },
      });
      return client;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      logger.error('Erro ao criar cliente', err);
      throw new AppError(500, 'Erro ao criar cliente');
    }
  }

  static async changeClientPlan(clientId: number, planNameOrId: string | number) {
    try {
      let plan;
      if (typeof planNameOrId === 'string') {
        plan = await prisma.plan.findUnique({ where: { name: planNameOrId } });
      } else {
        plan = await prisma.plan.findUnique({ where: { id: Number(planNameOrId) } });
      }
      if (!plan) throw new AppError(404, 'Plano não encontrado');
      const client = await prisma.client.update({ where: { id: clientId }, data: { planId: plan.id } });
      return client;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      logger.error('Erro ao alterar plano do cliente', err);
      throw new AppError(500, 'Erro ao alterar plano do cliente');
    }
  }

  static async setUserPassword(userId: number, newPassword: string) {
    try {
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash(newPassword, 10);
      const user = await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
      return { id: user.id, email: user.email };
    } catch (err: any) {
      logger.error('Erro ao setar senha do usuário', err);
      throw new AppError(500, 'Erro ao setar senha do usuário');
    }
  }

  static async createUser(data: any) {
    try {
      const passwordHash = data.password ? await import('bcryptjs').then(m => m.hash(data.password, 10)) : undefined;
      const role = data.role ? String(data.role).toUpperCase() : 'USER';
      // validate role
      const allowed = ['ADMIN', 'CLIENT', 'USER'];
      if (!allowed.includes(role)) throw new AppError(400, 'Role inválida');

      // Try creating with `username` if available in Prisma schema; if the
      // generated Prisma client doesn't include `username` (migration not
      // applied yet), retry without it to avoid 500s.
      try {
        const user = await prisma.user.create({
          data: {
            email: data.email || null,
            username: data.username || null,
            passwordHash,
            role,
            clientId: data.clientId || null,
            permissions: data.permissions || undefined,
          },
          select: { id: true, email: true, username: true, role: true, clientId: true },
        });
        return user;
      } catch (err: any) {
        const msg = String(err && err.message || '');
        if (msg.includes('Unknown argument `username`') || err.name === 'PrismaClientValidationError') {
          const user = await prisma.user.create({
            data: {
              email: data.email || null,
              passwordHash,
              role,
              clientId: data.clientId || null,
              permissions: data.permissions || undefined,
            },
            select: { id: true, email: true, role: true, clientId: true },
          });
          return user;
        }
        throw err;
      }
    } catch (err: any) {
      logger.error('Erro ao criar usuário', err);
      throw new AppError(500, 'Erro ao criar usuário');
    }
  }

  static async changeUserRole(userId: number, role: string) {
    try {
      const newRole = String(role).toUpperCase();
      const allowed = ['ADMIN', 'CLIENT', 'USER'];
      if (!allowed.includes(newRole)) throw new AppError(400, 'Role inválida');

      const user = await prisma.user.update({ where: { id: userId }, data: { role: newRole } });
      return user;
    } catch (err: any) {
      logger.error('Erro ao alterar role do usuário', err);
      throw new AppError(500, 'Erro ao alterar role do usuário');
    }
  }

  static async updateUser(userId: number, data: any) {
    try {
      const allowed: any = {} as any;
      if (data.permissions) allowed.permissions = data.permissions;
      if (data.email) allowed.email = data.email;
      if (data.username) allowed.username = data.username;
      if (data.role) allowed.role = String(data.role).toUpperCase();
      try {
        const user = await prisma.user.update({ where: { id: userId }, data: allowed });
        return user;
      } catch (err: any) {
        const msg = String(err && err.message || '');
        if (msg.includes('Unknown argument `username`') || err.name === 'PrismaClientValidationError') {
          // remove username and retry
          delete allowed.username;
          const user = await prisma.user.update({ where: { id: userId }, data: allowed });
          return user;
        }
        throw err;
      }
    } catch (err: any) {
      logger.error('Erro ao atualizar usuário', err);
      throw new AppError(500, 'Erro ao atualizar usuário');
    }
  }

  static async deleteUser(userId: number) {
    try {
      const u = await prisma.user.findUnique({ where: { id: userId } });
      if (!u) throw new AppError(404, 'Usuário não encontrado');
      // Permanently delete user
      await prisma.user.delete({ where: { id: userId } });
      logger.info(`Usuário deletado: ${userId}`);
      return { ok: true };
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      logger.error('Erro ao deletar usuário', err);
      throw new AppError(500, 'Erro ao deletar usuário');
    }
  }
}

export default AdminService;
