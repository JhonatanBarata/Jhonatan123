import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { AppError } from './errorHandler';

export function requireFeature(feature: string) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      // If the authenticated user is master, bypass plan checks
      const authUser: any = (req as any).user;
      if (authUser && (authUser.role === 'master' || authUser.sub === 0)) return next();

      // try common places for clientId
      const clientIdRaw = (req.body && (req.body as any).clientId) || req.query.clientId || (req.params && (req.params as any).clientId);
      let clientId: number | undefined;
      if (clientIdRaw) clientId = Number(clientIdRaw);

      // if no clientId, try to infer from product id param
      if (!clientId && req.params && (req.params as any).id) {
        const maybeProductId = Number((req.params as any).id);
        if (!Number.isNaN(maybeProductId)) {
          const product = await prisma.product.findUnique({ where: { id: maybeProductId } });
          if (product && product.clientId) clientId = product.clientId;
        }
      }

      if (!clientId) {
        throw new AppError(400, 'clientId não informado para verificação de permissão');
      }

      const client = await prisma.client.findUnique({ where: { id: clientId }, include: { plan: true } });
      if (!client) throw new AppError(404, 'Cliente não encontrado');

      const features: any = (client.plan && client.plan.features) || {};
      if (features[feature]) return next();

      throw new AppError(403, 'Recurso não disponível no plano do cliente');
    } catch (err: any) {
      if (err instanceof AppError) return res.status(err.statusCode || 400).json({ error: err.message });
      logger.error('Erro na verificação de feature:', err);
      return res.status(500).json({ error: 'Erro na verificação de permissões' });
    }
  };
}

export default requireFeature;
