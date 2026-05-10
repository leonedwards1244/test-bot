import TelegramBot from 'node-telegram-bot-api';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import { commandLogger, adminOnly } from './middleware';
import { handleStart, handleHelp, handleTrackWallet, handleCopyTrade, handleBridgeFunds, handleStealthWallet } from './commands';

const userStates = new Map<string, any>();

export function createTelegramBot(): TelegramBot {
  if (!config.telegram.token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not defined');
  }

  const bot = new TelegramBot(config.telegram.token, { polling: true });

  bot.onText(/\/start/, async (message) => {
    commandLogger('start', String(message.from?.id), []);
    await handleStart(bot, message);
  });

  bot.onText(/\/help/, async (message) => {
    commandLogger('help', String(message.from?.id), []);
    await handleHelp(bot, message);
  });

  bot.onText(/\/track_wallet/, async (message) => {
    const userId = String(message.from?.id);
    userStates.set(userId, { action: 'track_wallet' });
    commandLogger('track_wallet', userId, []);
    await bot.sendMessage(message.chat.id, 'Please provide the wallet address to track.');
  });

  bot.onText(/\/copy_trade/, async (message) => {
    const userId = String(message.from?.id);
    userStates.set(userId, { action: 'copy_trade', step: 1, data: {} });
    commandLogger('copy_trade', userId, []);
    await bot.sendMessage(message.chat.id, 'Please provide the risk profile (low/medium/high):');
  });

  bot.onText(/\/bridge_funds/, async (message) => {
    const userId = String(message.from?.id);
    userStates.set(userId, { action: 'bridge_funds', step: 1, data: {} });
    commandLogger('bridge_funds', userId, []);
    await bot.sendMessage(message.chat.id, 'Please provide the source wallet address:');
  });

  bot.onText(/\/stealth_wallet/, async (message) => {
    commandLogger('stealth_wallet', String(message.from?.id), []);
    await handleStealthWallet(bot, message);
  });

  bot.on('message', async (message) => {
    if (!message.text || message.text.startsWith('/')) {
      return;
    }

    const userId = String(message.from?.id);
    const state = userStates.get(userId);

    if (state) {
      if (state.action === 'track_wallet') {
        await handleTrackWallet(bot, message, message.text.trim());
        userStates.delete(userId);
      } else if (state.action === 'copy_trade') {
        await handleCopyTradeStep(bot, message, state);
      } else if (state.action === 'bridge_funds') {
        await handleBridgeFundsStep(bot, message, state);
      }
    } else {
      if (message.from && !adminOnly(message)) {
        logger.debug('Ignoring non-command message from non-admin user', { user: message.from.id });
      }
    }
  });

  bot.on('polling_error', (error) => {
    logger.error('Telegram polling error', { error });
  });

  return bot;
}

async function handleCopyTradeStep(bot: TelegramBot, message: any, state: any) {
  const userId = String(message.from?.id);
  const input = message.text.trim();

  if (state.step === 1) {
    if (!['low', 'medium', 'high'].includes(input)) {
      await bot.sendMessage(message.chat.id, 'Invalid risk profile. Please choose low, medium, or high.');
      return;
    }
    state.data.riskProfile = input;
    state.step = 2;
    await bot.sendMessage(message.chat.id, 'Please provide the target trader wallet address:');
  } else if (state.step === 2) {
    state.data.targetWallet = input;
    state.step = 3;
    await bot.sendMessage(message.chat.id, 'Please provide the amount in SOL:');
  } else if (state.step === 3) {
    const amount = Number(input);
    if (isNaN(amount) || amount <= 0) {
      await bot.sendMessage(message.chat.id, 'Invalid amount. Please provide a positive number.');
      return;
    }
    state.data.amountSol = amount;
    state.step = 4;
    await bot.sendMessage(message.chat.id, 'Please provide your source private key:');
  } else if (state.step === 4) {
    state.data.sourceKey = input;
    await handleCopyTrade(bot, message, state.data);
    userStates.delete(userId);
  }
}

async function handleBridgeFundsStep(bot: TelegramBot, message: any, state: any) {
  const userId = String(message.from?.id);
  const input = message.text.trim();

  if (state.step === 1) {
    state.data.sourceAddress = input;
    state.step = 2;
    await bot.sendMessage(message.chat.id, 'Please provide the destination chain (e.g., 1 for Ethereum, 137 for Polygon):');
  } else if (state.step === 2) {
    state.data.destinationChain = input;
    state.step = 3;
    await bot.sendMessage(message.chat.id, 'Please provide the amount to bridge:');
  } else if (state.step === 3) {
    state.data.amount = input;
    await handleBridgeFunds(bot, message, state.data.sourceAddress, '', state.data.destinationChain, state.data.amount);
    userStates.delete(userId);
  }
}
