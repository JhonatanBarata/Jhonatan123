import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Handle our AppError wrapper
  if (err instanceof AppError) {
    logger.error(`[${err.statusCode}] ${err.message}`);
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Handle Zod validation errors (client input validation)
  // ZodError has name === 'ZodError' and `issues` property
  // Send a 400 with details to help the frontend show meaningful feedback
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (err && (err as any).name === 'ZodError') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const issues = (err as any).issues || (err as any).errors || err.message;
    logger.error('Validation error:', issues);
    return res.status(400).json({ error: 'Validation error', issues });
  }

  // body-parser JSON parse errors: err.type === 'entity.parse.failed'
  // respond with 400 and the original message
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (err && (err as any).type === 'entity.parse.failed') {
    logger.error('JSON parse failed:', (err as any).body || err.message);
    return res.status(400).json({ error: 'JSON inválido' });
  }

  logger.error('Erro interno:', err);
  return res.status(500).json({ error: 'Erro interno do servidor' });
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
