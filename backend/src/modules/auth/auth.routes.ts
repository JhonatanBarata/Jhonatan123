import { Router } from 'express';
import { AuthService } from './auth.service';
import { RegisterSchema, LoginSchema } from '../../utils/schemas';
import { authMiddleware } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const data = RegisterSchema.parse(req.body);
    const result = await AuthService.register(data);
    res.status(201).json({ message: 'Usuário registrado ✅', ...result });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const data = LoginSchema.parse(req.body);
    const result = await AuthService.login(data);
    res.json({ message: 'Login OK ✅', ...result });
  })
);

router.get(
  '/profile',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userId = (req as any).user.sub;
    const user = await AuthService.getProfile(userId);
    res.json(user);
  })
);

router.get(
  '/navigation',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const authUser: any = (req as any).user;

    // master gets full menu
    if (authUser && (authUser.role === 'master' || authUser.sub === 0)) {
      return res.json({ menu: ['catalog', 'orders', 'delivery', 'billing', 'reports', 'admin'] });
    }

    // client-specific menu requires clientId (query or body)
    const clientIdRaw = req.query.clientId || (req.body && (req.body as any).clientId);
    if (!clientIdRaw) return res.json({ menu: ['catalog'] });
    const clientId = Number(clientIdRaw);
    const client = await (await import('../../config/database')).prisma.client.findUnique({ where: { id: clientId }, include: { plan: true } });
    if (!client) return res.json({ menu: ['catalog'] });
    const features: any = (client.plan && client.plan.features) || {};
    const menu: string[] = [];
    if (features.catalog_view) menu.push('catalog');
    if (features.whatsapp_integration) menu.push('whatsapp');
    if (features.catalog_edit) menu.push('catalog_edit');
    if (features.realtime_tracking) menu.push('delivery');
    if (features.billing) menu.push('billing');
    if (features.reports) menu.push('reports');
    res.json({ menu });
  })
);

  // Change own password
  router.put('/password', authMiddleware, asyncHandler(async (req, res) => {
    const authUser: any = (req as any).user;
    const userId = Number(authUser.sub);
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || String(newPassword).length < 4) throw new Error('Senha inválida');
    const result = await (await import('./auth.service')).AuthService.changePassword(userId, currentPassword, newPassword);
    res.json({ message: 'Senha alterada', ...result });
  }));

export default router;
