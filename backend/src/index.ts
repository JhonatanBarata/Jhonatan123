import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './config/database';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './modules/auth/auth.routes';
import themeRoutes from './modules/auth/theme.routes';
import productsRoutes from './modules/products/products.routes';
import pedidosRoutes from './modules/pedidos/pedidos.routes';
import clientsRoutes from './modules/clients/clients.routes';
import path from 'path';

const app = express();

// Middleware
app.use(express.json());
// Allow requests from frontend origin (set FRONTEND_URL in env)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Serve uploaded images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get('/', (_req, res) => {
  res.json({ ok: true, message: 'API rodando ✅' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/theme', themeRoutes);
app.use('/products', productsRoutes);
app.use('/pedidos', pedidosRoutes);
app.use('/clients', clientsRoutes);

// Error handler (deve ser o último middleware)
app.use(errorHandler);

// Start server
const PORT = process.env.APP_PORT || 3000;

async function start() {
  try {
    // Testa conexão com banco
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Banco de dados conectado');

    app.listen(Number(PORT), '0.0.0.0', () => {
      logger.info(`🚀 API rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error('❌ Erro ao iniciar servidor:', err);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Desligando...');
  await prisma.$disconnect();
  process.exit(0);
});
