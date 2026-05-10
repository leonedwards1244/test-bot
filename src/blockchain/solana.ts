import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { config } from '../utils/config';
import { logger } from '../utils/logger';

export const connection = new Connection(config.solana.rpcUrl, 'confirmed');

export async function getWalletBalance(address: string): Promise<number> {
  const publicKey = new PublicKey(address);
  const balance = await connection.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL;
}

export async function buildTransferTransaction(from: Keypair, toAddress: string, amountSol: number): Promise<Transaction> {
  const destination = new PublicKey(toAddress);
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: destination,
      lamports: Math.round(amountSol * LAMPORTS_PER_SOL)
    })
  );
  transaction.feePayer = from.publicKey;
  transaction.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
  return transaction;
}

export async function sendSolanaPayment(from: Keypair, toAddress: string, amountSol: number): Promise<string> {
  try {
    const tx = await buildTransferTransaction(from, toAddress, amountSol);
    const signature = await sendAndConfirmTransaction(connection, tx, [from]);
    logger.info(`Solana payment sent: ${signature}`);
    return signature;
  } catch (error) {
    logger.error('Solana payment failed', { error });
    throw error;
  }
}

export function loadKeypairFromSecret(secretKey: string): Keypair {
  const bytes = Uint8Array.from(secretKey.split(',').map((value) => Number(value.trim())));
  return Keypair.fromSecretKey(bytes);
}
