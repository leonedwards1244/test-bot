import http from 'http';
import { initializeDatabase } from './db';
import { createTelegramBot } from './bot/telegram';
import { logger } from './utils/logger';

const PORT = Number(process.env.PORT) || 3000;

let bot: any;

// HTTP health-check server — starts immediately so Railway can verify the
// process is alive before the bot and database finish initialising.
const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', service: 'solopoly' }));
});

server.listen(PORT, () => {
  logger.info(`Health-check server listening on port ${PORT}`);
});

async function bootstrap(): Promise<void> {
  try {
    await initializeDatabase();
    logger.info('Database initialised');
  } catch (error) {
    logger.error('Database initialisation failed — continuing without DB', { error });
  }

  try {
    bot = createTelegramBot();
    logger.info('Solopoly started successfully. Bot is polling for messages...');
  } catch (error) {
    logger.error('Telegram bot failed to start — continuing without bot', { error });
  }
}

bootstrap();

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down...');
  server.close();
  if (bot) {
    await bot.stopPolling();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down...');
  server.close();
  if (bot) {
    await bot.stopPolling();
  }
  process.exit(0);
});
