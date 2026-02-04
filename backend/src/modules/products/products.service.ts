import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';
import { AppError } from '../../middleware/errorHandler';
import { CreateProductInput, UpdateProductInput } from '../../utils/schemas';

export class ProductsService {
  static async findAll(clientId?: number) {
    try {
      const where = clientId ? { clientId } : undefined;
      const products = await prisma.product.findMany({
        where,
        orderBy: { id: 'desc' },
      });
      return products;
    } catch (error) {
      logger.error('Erro ao buscar produtos:', error);
      throw new AppError(500, 'Erro ao buscar produtos');
    }
  }

  static async create(data: CreateProductInput) {
    try {
      const product = await prisma.product.create({
        data: {
          name: data.name,
          description: data.description,
          price: String(data.price), // Prisma Decimal
          imageUrl: data.imageUrl,
          ...(data.clientId && { clientId: data.clientId }),
        },
      });
      logger.info(`Produto criado: ${product.id}`);
      return product;
    } catch (error) {
      logger.error('Erro ao criar produto:', error);
      throw new AppError(500, 'Erro ao criar produto');
    }
  }

  static async update(id: number, data: UpdateProductInput) {
    try {
      // Verifica se produto existe
      const productExists = await prisma.product.findUnique({
        where: { id },
      });
      if (!productExists) {
        throw new AppError(404, 'Produto não encontrado');
      }

      const product = await prisma.product.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.price && { price: String(data.price) }),
          ...(data.imageUrl && { imageUrl: data.imageUrl }),
          ...(data.clientId !== undefined && { clientId: data.clientId }),
        },
      });
      logger.info(`Produto atualizado: ${id}`);
      return product;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao atualizar produto:', error);
      throw new AppError(500, 'Erro ao atualizar produto');
    }
  }

  static async delete(id: number) {
    try {
      const productExists = await prisma.product.findUnique({
        where: { id },
      });
      if (!productExists) {
        throw new AppError(404, 'Produto não encontrado');
      }

      await prisma.product.delete({
        where: { id },
      });
      logger.info(`Produto deletado: ${id}`);
      return { ok: true };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao deletar produto:', error);
      throw new AppError(500, 'Erro ao deletar produto');
    }
  }
}
