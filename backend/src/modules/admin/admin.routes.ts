import { Router } from 'express';
import { AdminService } from './admin.service';
import { authMiddleware } from '../../middleware/auth';
import requireRole from '../../middleware/roles';
import Roles from '../../middleware/rolesDecorator';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

// All admin routes require authentication; per-route role checks apply
router.use(authMiddleware);

router.get('/plans', asyncHandler(async (_req, res) => {
  const plans = await AdminService.listPlans();
  res.json(plans);
}));

router.post('/plans', requireRole(['MASTER']), asyncHandler(async (req, res) => {
  const { name, features, defaultPlan } = req.body;
  const plan = await AdminService.createPlan(name, features || {}, !!defaultPlan);
  res.status(201).json(plan);
}));

router.put('/plans/:id', requireRole(['MASTER']), asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const plan = await AdminService.updatePlan(id, req.body);
  res.json(plan);
}));

router.get('/clients', requireRole(['MASTER']), asyncHandler(async (_req, res) => {
  const clients = await AdminService.listClients();
  res.json(clients);
}));

router.post('/clients', requireRole(['MASTER']), asyncHandler(async (req, res) => {
  const client = await AdminService.createClient(req.body);
  res.status(201).json(client);
}));

router.put('/clients/:id/plan', requireRole(['MASTER']), asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { plan } = req.body; // planName or planId
  const client = await AdminService.changeClientPlan(id, plan);
  res.json(client);
}));

// Users management
// Create user: ADMIN or MASTER
router.post('/users', requireRole(['ADMIN','MASTER']), asyncHandler(async (req, res) => {
  const user = await AdminService.createUser(req.body);
  res.status(201).json(user);
}));

// Change role: MASTER only
router.put('/users/:id/role', requireRole(['MASTER']), asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { role } = req.body;
  const user = await AdminService.changeUserRole(id, role);
  res.json(user);
}));

// Change password for a user (MASTER or ADMIN may set any user's password)
router.put('/users/:id/password', requireRole(['MASTER','ADMIN']), asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { password } = req.body;
  if (!password || String(password).length < 4) return res.status(400).json({ error: 'Senha inválida' });
  const result = await AdminService.setUserPassword(id, password);
  res.json({ message: 'Senha atualizada', ...result });
}));

// Update user (permissions, email, role)
router.put('/users/:id', requireRole(['ADMIN','MASTER']), asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const payload = req.body;
  const user = await AdminService.updateUser(id, payload);
  res.json(user);
}));

// Delete user (permanent)
router.delete('/users/:id', requireRole(['ADMIN','MASTER']), asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const result = await AdminService.deleteUser(id);
  res.json(result);
}));

export default router;
