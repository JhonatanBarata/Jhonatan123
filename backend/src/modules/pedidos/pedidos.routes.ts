import { Router } from 'express';
import { PedidosService } from './pedidos.service';
import { CreatePedidoSchema, UpdatePedidoSchema } from '../../utils/schemas';
import { authMiddleware } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// GET /pedidos
router.get(
  '/',
  asyncHandler(async (_req: import('express').Request, res: import('express').Response) => {
    const pedidos = await PedidosService.findAll();
    res.json(pedidos);
  })
);

// POST /pedidos
router.post(
  '/',
  asyncHandler(async (req: import('express').Request, res: import('express').Response) => {
    const data = CreatePedidoSchema.parse(req.body);
    const pedido = await PedidosService.create(data);
    res.status(201).json(pedido);
  })
);

// PUT /pedidos/:id
router.put(
  '/:id',
  asyncHandler(async (req: import('express').Request, res: import('express').Response) => {
    const id = Array.isArray(req.params.id) ? parseInt(req.params.id[0]) : parseInt(req.params.id);
    const data = UpdatePedidoSchema.parse(req.body);
    const pedido = await PedidosService.update(id, data);
    res.json(pedido);
  })
);

// DELETE /pedidos/:id
router.delete(
  '/:id',
  asyncHandler(async (req: import('express').Request, res: import('express').Response) => {
    const id = Array.isArray(req.params.id) ? parseInt(req.params.id[0]) : parseInt(req.params.id);
    const result = await PedidosService.delete(id);
    res.json(result);
  })
);

export default router;
