import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';
import { AppError } from '../../middleware/errorHandler';
import bcrypt from 'bcryptjs';
import { CreateClientInput, UpdateClientInput } from '../../utils/schemas';

export class ClientsService {
  static async findAll() {
    try {
      return await prisma.client.findMany({ orderBy: { id: 'desc' } });
    } catch (error) {
      logger.error('Erro ao buscar clientes:', error);
      throw new AppError(500, 'Erro ao buscar clientes');
    }
  }

  static async findById(id: number) {
    try {
      const client = await prisma.client.findUnique({ where: { id }, include: { products: true } });
      if (!client) throw new AppError(404, 'Cliente não encontrado');
      return client;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao buscar cliente:', error);
      throw new AppError(500, 'Erro ao buscar cliente');
    }
  }

  static async create(data: CreateClientInput) {
    try {
      const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;
      const client = await prisma.client.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          passwordHash,
        },
      });
      logger.info(`Cliente criado: ${client.id}`);
      return client;
    } catch (error) {
      logger.error('Erro ao criar cliente:', error);
      throw new AppError(500, 'Erro ao criar cliente');
    }
  }

  static async update(id: number, data: UpdateClientInput) {
    try {
      const clientExists = await prisma.client.findUnique({ where: { id } });
      if (!clientExists) throw new AppError(404, 'Cliente não encontrado');

      const updateData: any = { ...data };
      if ((data as any).password) updateData.passwordHash = await bcrypt.hash((data as any).password, 10);

      const client = await prisma.client.update({ where: { id }, data: updateData });
      logger.info(`Cliente atualizado: ${id}`);
      return client;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao atualizar cliente:', error);
      throw new AppError(500, 'Erro ao atualizar cliente');
    }
  }

  static async delete(id: number) {
    try {
      const clientExists = await prisma.client.findUnique({ where: { id } });
      if (!clientExists) throw new AppError(404, 'Cliente não encontrado');
      await prisma.client.delete({ where: { id } });
      logger.info(`Cliente deletado: ${id}`);
      return { ok: true };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao deletar cliente:', error);
      throw new AppError(500, 'Erro ao deletar cliente');
    }
  }
}
