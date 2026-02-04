import { z } from 'zod';

// ===== AUTH =====
export const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(4, 'Password mínimo 4 caracteres'),
});

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password é obrigatório'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

// ===== PRODUTOS =====
export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  price: z.number().positive('Preço deve ser positivo'),
  imageUrl: z.string().url().optional(),
  clientId: z.number().int().positive().optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

// ===== CLIENTS =====
export const CreateClientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  password: z.string().min(4).optional(),
});

export const UpdateClientSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  blocked: z.boolean().optional(),
  paid: z.boolean().optional(),
});

export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;

// ===== PEDIDOS =====
export const CreatePedidoSchema = z.object({
  clienteNome: z.string().min(1, 'Nome do cliente é obrigatório'),
  produtoId: z.number().int().positive('Produto ID inválido'),
  quantidade: z.number().int().positive('Quantidade deve ser positiva'),
});

export const UpdatePedidoSchema = z.object({
  clienteNome: z.string().optional(),
  produtoId: z.number().int().positive().optional(),
  quantidade: z.number().int().positive().optional(),
  status: z.enum(['pendente', 'em-preparo', 'pronto', 'entregue']).optional(),
});

export type CreatePedidoInput = z.infer<typeof CreatePedidoSchema>;
export type UpdatePedidoInput = z.infer<typeof UpdatePedidoSchema>;
