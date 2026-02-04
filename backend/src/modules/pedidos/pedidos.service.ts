import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';
import { AppError } from '../../middleware/errorHandler';
import { CreatePedidoInput, UpdatePedidoInput } from '../../utils/schemas';

export class PedidosService {
  static async findAll() {
    try {
      const pedidos = await prisma.pedido.findMany({
        include: { produto: true },
        orderBy: { id: 'desc' },
      });
      return pedidos;
    } catch (error) {
      logger.error('Erro ao buscar pedidos:', error);
      throw new AppError(500, 'Erro ao buscar pedidos');
    }
  }

  static async create(data: CreatePedidoInput) {
    try {
      // Verifica se produto existe
      const produto = await prisma.product.findUnique({
        where: { id: data.produtoId },
      });
      if (!produto) {
        throw new AppError(404, 'Produto não encontrado');
      }

      const pedido = await prisma.pedido.create({
        data: {
          clienteNome: data.clienteNome,
          produtoId: data.produtoId,
          quantidade: data.quantidade,
        },
        include: { produto: true },
      });
      logger.info(`Pedido criado: ${pedido.id}`);
      return pedido;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao criar pedido:', error);
      throw new AppError(500, 'Erro ao criar pedido');
    }
  }

  static async update(id: number, data: UpdatePedidoInput) {
    try {
      const pedidoExists = await prisma.pedido.findUnique({
        where: { id },
      });
      if (!pedidoExists) {
        throw new AppError(404, 'Pedido não encontrado');
      }

      // Se produtoId for alterado, valida se existe
      if (data.produtoId) {
        const produto = await prisma.product.findUnique({
          where: { id: data.produtoId },
        });
        if (!produto) {
          throw new AppError(404, 'Produto não encontrado');
        }
      }

      const pedido = await prisma.pedido.update({
        where: { id },
        data: {
          ...(data.clienteNome && { clienteNome: data.clienteNome }),
          ...(data.produtoId && { produtoId: data.produtoId }),
          ...(data.quantidade && { quantidade: data.quantidade }),
          ...(data.status && { status: data.status }),
        },
        include: { produto: true },
      });
      logger.info(`Pedido atualizado: ${id}`);
      return pedido;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao atualizar pedido:', error);
      throw new AppError(500, 'Erro ao atualizar pedido');
    }
  }

  static async delete(id: number) {
    try {
      const pedidoExists = await prisma.pedido.findUnique({
        where: { id },
      });
      if (!pedidoExists) {
        throw new AppError(404, 'Pedido não encontrado');
      }

      await prisma.pedido.delete({
        where: { id },
      });
      logger.info(`Pedido deletado: ${id}`);
      return { ok: true };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao deletar pedido:', error);
      throw new AppError(500, 'Erro ao deletar pedido');
    }
  }
}
