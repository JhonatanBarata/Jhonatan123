import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt';

export interface AuthRequest extends Request {
  user?: any; // token payload (sub, email, role, features, ...)
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      logger.warn('Token ausente na requisição');
      return res.status(401).json({ error: 'Sem token' });
    }

    const token = auth.split(' ')[1];
    if (!token) {
      logger.warn('Formato de token inválido');
      return res.status(401).json({ error: 'Formato de token inválido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Erro ao validar token:', error);
    return res.status(401).json({ error: 'Token inválido' });
  }
}
