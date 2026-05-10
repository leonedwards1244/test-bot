import { initializeDatabase } from './db';
import { createTelegramBot } from './bot/telegram';
import { logger } from './utils/logger';

let bot: any;

async function bootstrap(): Promise<void> {
  try {
    await initializeDatabase();
    bot = createTelegramBot();
    logger.info('Solopoly started successfully. Bot is polling for messages...');
  } catch (error) {
    logger.error('Failed to start Solopoly', { error });
    process.exit(1);
  }
}

bootstrap();

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down bot...');
  if (bot) {
    await bot.stopPolling();
  }
  process.exit(0);
});
