import { Keypair } from '@solana/web3.js';
import { sendSolanaPayment, loadKeypairFromSecret } from '../blockchain/solana';
import { logger } from '../utils/logger';

export interface CopyTradeInstruction {
  userId: string;
  sourcePrivateKey: string;
  traderWallet: string;
  amountSol: number;
  riskProfile: 'low' | 'medium' | 'high';
  stealthEnabled: boolean;
}

export async function executeCopyTrade(instruction: CopyTradeInstruction): Promise<string> {
  const fromKeypair = loadKeypairFromSecret(instruction.sourcePrivateKey);
  try {
    const destination = instruction.traderWallet;
    const signature = await sendSolanaPayment(fromKeypair, destination, instruction.amountSol);
    logger.info('Copy trade executed', { userId: instruction.userId, destination, amount: instruction.amountSol, signature });
    return signature;
  } catch (error) {
    logger.error('Error executing copy trade', { error, userId: instruction.userId, destination: instruction.traderWallet });
    throw error;
  }
}
