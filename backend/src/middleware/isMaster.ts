import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export function isMaster(req: Request, _res: Response, next: NextFunction) {
  const user: any = (req as any).user;
  if (!user) throw new AppError(401, 'Não autenticado');
  if (user.role === 'master' || user.sub === 0) return next();
  throw new AppError(403, 'Acesso restrito ao master');
}

export default isMaster;
