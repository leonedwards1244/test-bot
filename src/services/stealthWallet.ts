import { Keypair } from '@solana/web3.js';
import { randomBytes } from 'crypto';
import { AppDataSource } from '../db';
import { UserPreference } from '../db/schemas';

export function createStealthKeypair(): Keypair {
  return Keypair.generate();
}

export function serializeKeypair(keypair: Keypair): string {
  return Array.from(keypair.secretKey).join(',');
}

export async function enableStealthMode(telegramUserId: string, config: Record<string, unknown>): Promise<UserPreference> {
  const repo = AppDataSource.getRepository(UserPreference);
  let pref = await repo.findOneBy({ telegramUserId });

  if (!pref) {
    pref = repo.create({ telegramUserId, copyTradingEnabled: false, riskProfile: 'standard', stealthConfig: {} });
  }

  pref.stealthConfig = { enabled: true, createdAt: new Date().toISOString(), ...config };
  return repo.save(pref);
}

export function generateAnonymousLabel(): string {
  return `stealth-${randomBytes(4).toString('hex')}`;
}
