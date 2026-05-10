import { Message } from 'node-telegram-bot-api';
import { trackWallet } from '../services/walletTracker';
import { executeCopyTrade } from '../services/copyTrading';
import { fetchLayerZeroQuote, publishBridgeTransfer, buildLayerZeroPayload } from '../blockchain/layerzero';
import { enableStealthMode, generateAnonymousLabel, serializeKeypair, createStealthKeypair } from '../services/stealthWallet';
import { logger } from '../utils/logger';

export async function handleStart(bot: any, message: Message): Promise<void> {
  await bot.sendMessage(
    message.chat.id,
    'Welcome to Solopoly. Use /track_wallet, /copy_trade, /bridge_funds, /stealth_wallet, /performance, or /help.'
  );
}

export async function handleHelp(bot: any, message: Message): Promise<void> {
  await bot.sendMessage(
    message.chat.id,
    '*Solopoly Help*\n- /track_wallet - Track a trader wallet\n- /copy_trade - Mirror a trade from a tracked wallet\n- /bridge_funds - Bridge Solana funds to another chain\n- /stealth_wallet - Create an anonymous wallet session\n- /performance - Show top trader scores',
    { parse_mode: 'Markdown' }
  );
}

export async function handleTrackWallet(bot: any, message: Message, walletAddress: string): Promise<void> {
  try {
    const result = await trackWallet(walletAddress);
    await bot.sendMessage(
      message.chat.id,
      `Wallet tracked: ${result.walletAddress}\nTotal PnL: ${result.totalPnl.toFixed(2)}\nWin rate: ${(
        result.winRate * 100
      ).toFixed(2)}%\nPositions: ${result.positionsCount}`
    );
  } catch (error) {
    logger.error('trackWallet failed', { error, walletAddress });
    await bot.sendMessage(message.chat.id, 'Unable to track wallet at this time. Please try again later.');
  }
}

export async function handleCopyTrade(bot: any, message: Message, payload: { sourceKey: string; targetWallet: string; amountSol: number; riskProfile: string }): Promise<void> {
  try {
    const signature = await executeCopyTrade({
      userId: String(message.from?.id),
      sourcePrivateKey: payload.sourceKey,
      traderWallet: payload.targetWallet,
      amountSol: payload.amountSol,
      riskProfile: payload.riskProfile as 'low' | 'medium' | 'high',
      stealthEnabled: false
    });

    await bot.sendMessage(message.chat.id, `Copy trade executed. TX: ${signature}`);
  } catch (error) {
    logger.error('copyTrade failed', { error });
    await bot.sendMessage(message.chat.id, 'Unable to execute copy trade. Please verify your wallet and amount.');
  }
}

export async function handleBridgeFunds(bot: any, message: Message, sourceAddress: string, destinationAddress: string, destinationChain: string, amount: string): Promise<void> {
  try {
    const quote = await fetchLayerZeroQuote(destinationChain, amount);
    const payload = buildLayerZeroPayload(sourceAddress, destinationAddress, destinationChain, Number(amount));
    const txId = await publishBridgeTransfer(payload);
    await bot.sendMessage(
      message.chat.id,
      `Bridge request sent. Destination: ${destinationChain}\nAmount: ${amount}\nEstimated fee: ${quote.estimatedFee}\nTransaction ID: ${txId}`
    );
  } catch (error) {
    logger.error('bridgeFunds failed', { error });
    await bot.sendMessage(message.chat.id, 'Unable to bridge funds right now. Please try again later.');
  }
}

export async function handleStealthWallet(bot: any, message: Message): Promise<void> {
  const stealthKeypair = createStealthKeypair();
  const serialized = serializeKeypair(stealthKeypair);
  await enableStealthMode(String(message.from?.id), { label: generateAnonymousLabel() });
  await bot.sendMessage(
    message.chat.id,
    `Stealth wallet created. Keep this secret key safe:\n${serialized}\nUse it only with trusted Solopoly commands.`
  );
}
