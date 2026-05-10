import { config } from '../utils/config';
import { logger } from '../utils/logger';

export function adminOnly(message: any): boolean {
  return config.telegram.adminIds.includes(String(message.from?.id));
}

export function commandLogger(command: string, userId: string, args: string[]): void {
  logger.info('Telegram command executed', { command, userId, args });
}
