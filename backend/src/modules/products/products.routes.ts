import { Router } from 'express';
import { ProductsService } from './products.service';
import { CreateProductSchema, UpdateProductSchema } from '../../utils/schemas';
import { authMiddleware } from '../../middleware/auth';
import { requireFeature } from '../../middleware/plan';
import { asyncHandler } from '../../middleware/errorHandler';
import multer from 'multer';
import path from 'path';

const upload = multer({ dest: path.join(process.cwd(), 'uploads') });

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// GET /products
router.get(
  '/',
  asyncHandler(async (req: import('express').Request, res: import('express').Response) => {
    const clientIdParam = req.query.clientId;
    const clientId = clientIdParam ? parseInt(String(clientIdParam)) : undefined;
    const products = await ProductsService.findAll(clientId);
    res.json(products);
  })
);

// POST /products
router.post(
  '/',
  requireFeature('catalog_edit'),
  asyncHandler(async (req: import('express').Request, res: import('express').Response) => {
    const data = CreateProductSchema.parse(req.body);
    const product = await ProductsService.create(data);
    res.status(201).json(product);
  })
);

// Upload image for product
router.post(
  '/:id/image',
  upload.single('image'),
  asyncHandler(async (req: import('express').Request, res: import('express').Response) => {
    const id = Array.isArray(req.params.id) ? parseInt(req.params.id[0]) : parseInt(req.params.id);
    if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado' });
    const imageUrl = `/uploads/${req.file.filename}`;
    const product = await ProductsService.update(id, { imageUrl } as any);
    res.json(product);
  })
);

// PUT /products/:id
router.put(
  '/:id',
  requireFeature('catalog_edit'),
  asyncHandler(async (req: import('express').Request, res: import('express').Response) => {
    const id = Array.isArray(req.params.id) ? parseInt(req.params.id[0]) : parseInt(req.params.id);
    const data = UpdateProductSchema.parse(req.body);
    const product = await ProductsService.update(id, data);
    res.json(product);
  })
);

// DELETE /products/:id
router.delete(
  '/:id',
  requireFeature('catalog_edit'),
  asyncHandler(async (req: import('express').Request, res: import('express').Response) => {
    const id = Array.isArray(req.params.id) ? parseInt(req.params.id[0]) : parseInt(req.params.id);
    const result = await ProductsService.delete(id);
    res.json(result);
  })
);

export default router;
