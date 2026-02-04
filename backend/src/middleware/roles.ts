import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';

export function requireRole(allowedRoles: string[]) {
  const normalized = allowedRoles.map((r) => String(r).toUpperCase());
  return function (req: Request, res: Response, next: NextFunction) {
    try {
      const authUser: any = (req as any).user;
      if (!authUser) throw new AppError(401, 'Não autenticado');

      // Master bypass: support legacy master token (role 'master' or sub === 0)
      const rawRole = authUser.role || '';
      const roleUpper = String(rawRole).toUpperCase();
      if (roleUpper === 'MASTER' || authUser.sub === 0) return next();

      if (normalized.includes(roleUpper)) return next();

      throw new AppError(403, 'Acesso negado: função insuficiente');
    } catch (err: any) {
      if (err instanceof AppError) return res.status(err.statusCode || 400).json({ error: err.message });
      logger.error('Erro no RolesGuard:', err);
      return res.status(500).json({ error: 'Erro ao verificar roles' });
    }
  };
}

export default requireRole;
