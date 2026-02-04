import { logger } from '../utils/logger';

// Simple stub for WhatsApp worker queue (MVP)
// In production replace with BullMQ/RabbitMQ job producer and a worker process

export async function enqueueWhatsAppMessage(clientId: number, to: string, message: string) {
  logger.info(`Enfileirando mensagem WhatsApp para client=${clientId} to=${to}`);
  // TODO: push to Redis/Bull queue. For MVP we'll just log.
  // Example: queue.add('whatsapp:send', { clientId, to, message });
  return { ok: true };
}

export async function sendWhatsAppMessageNow(clientId: number, to: string, message: string) {
  logger.info(`(stub) Enviando WhatsApp para client=${clientId} to=${to} msg=${message}`);
  // Implement provider integration (Twilio/360dialog/Meta) here.
  return { ok: true };
}
