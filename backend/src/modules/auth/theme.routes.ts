import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

router.get(
  '/theme',
  authMiddleware,
  asyncHandler(async (req: import('express').Request, res: import('express').Response) => {
    const userId = (req as any).user.sub;

    // Buscar tema personalizado do usuário
    const userTheme = await prisma.userTheme.findUnique({
      where: { userId },
    });

    if (userTheme) {
      res.json(userTheme.theme);
    } else {
      // Tema padrão baseado no domínio do email
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      const domain = user?.email.split('@')[1] || 'default';
      const defaultTheme = getDefaultThemeByDomain(domain);
      res.json(defaultTheme);
    }
  })
);

router.put(
  '/theme',
  authMiddleware,
  asyncHandler(async (req: import('express').Request, res: import('express').Response) => {
    const userId = (req as any).user.sub;
    const themeData = req.body;

    // Validar dados do tema
    const validatedTheme = {
      primary: themeData.primary || '#3b82f6',
      secondary: themeData.secondary || '#f1f5f9',
      accent: themeData.accent || '#f59e0b',
      background: themeData.background || '#ffffff',
      text: themeData.text || '#1f2937',
      border: themeData.border || '#e5e7eb',
      businessName: themeData.businessName || 'Minha Lanchonete',
      slogan: themeData.slogan || 'O melhor da cidade!',
      logo: themeData.logo,
    };

    // Salvar ou atualizar tema personalizado
    const theme = await prisma.userTheme.upsert({
      where: { userId },
      update: { theme: validatedTheme },
      create: { userId, theme: validatedTheme },
    });

    res.json(theme.theme);
  })
);

function getDefaultThemeByDomain(domain: string) {
  const themes: Record<string, any> = {
    'pizzaria.com': {
      primary: '#dc2626',
      secondary: '#fef2f2',
      accent: '#fbbf24',
      background: '#ffffff',
      text: '#1f2937',
      border: '#e5e7eb',
      businessName: 'Pizzaria do João',
      slogan: 'Pizza artesanal desde 1995'
    },
    'burger.com': {
      primary: '#059669',
      secondary: '#ecfdf5',
      accent: '#f59e0b',
      background: '#ffffff',
      text: '#1f2937',
      border: '#e5e7eb',
      businessName: 'Burger House',
      slogan: 'Hambúrgueres gourmet'
    },
    'sushi.com': {
      primary: '#7c3aed',
      secondary: '#f3e8ff',
      accent: '#06b6d4',
      background: '#ffffff',
      text: '#1f2937',
      border: '#e5e7eb',
      businessName: 'Sushi Master',
      slogan: 'Sabor oriental autêntico'
    },
    default: {
      primary: '#3b82f6',
      secondary: '#f1f5f9',
      accent: '#f59e0b',
      background: '#ffffff',
      text: '#1f2937',
      border: '#e5e7eb',
      businessName: 'Minha Lanchonete',
      slogan: 'O melhor da cidade!'
    }
  };

  return themes[domain] || themes.default;
}

export default router;