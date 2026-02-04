import { Router } from 'express';
import { ClientsService } from './clients.service';
import { CreateClientSchema, UpdateClientSchema } from '../../utils/schemas';
import { authMiddleware } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const clients = await ClientsService.findAll();
    res.json(clients);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = CreateClientSchema.parse(req.body);
    const client = await ClientsService.create(data);
    res.status(201).json(client);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? parseInt(req.params.id[0]) : parseInt(req.params.id);
    const client = await ClientsService.findById(id);
    res.json(client);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? parseInt(req.params.id[0]) : parseInt(req.params.id);
    const data = UpdateClientSchema.parse(req.body);
    const client = await ClientsService.update(id, data as any);
    res.json(client);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? parseInt(req.params.id[0]) : parseInt(req.params.id);
    const result = await ClientsService.delete(id);
    res.json(result);
  })
);

export default router;
