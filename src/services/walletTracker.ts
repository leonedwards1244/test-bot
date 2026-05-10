import { TrackedWallet, TraderScore } from '../db/schemas';
import { AppDataSource } from '../db';
import { fetchWalletPositions } from '../blockchain/polymarket';
import { logger } from '../utils/logger';

export interface WalletAnalyticsResult {
  walletAddress: string;
  totalPnl: number;
  winRate: number;
  positionsCount: number;
}

export async function trackWallet(walletAddress: string): Promise<WalletAnalyticsResult> {
  const walletRepo = AppDataSource.getRepository(TrackedWallet);
  let tracked = await walletRepo.findOneBy({ walletAddress });

  if (!tracked) {
    tracked = walletRepo.create({ walletAddress, status: 'active' });
    await walletRepo.save(tracked);
  }

  const analytics = await fetchWalletPositions(walletAddress);
  const scoreRepo = AppDataSource.getRepository(TraderScore);
  const traderScore = scoreRepo.create({
    walletAddress,
    score: calculateTraderScore(analytics),
    metrics: {
      totalPnl: analytics.totalPnl,
      winRate: analytics.winRate,
      positions: analytics.positions.length
    }
  });

  await scoreRepo.save(traderScore);

  logger.info(`Tracked wallet ${walletAddress}. score=${traderScore.score}`);

  return {
    walletAddress,
    totalPnl: analytics.totalPnl,
    winRate: analytics.winRate,
    positionsCount: analytics.positions.length
  };
}

export function calculateTraderScore(analytics: { totalPnl: number; winRate: number; positions: unknown[] }): number {
  const base = analytics.totalPnl * 0.6 + analytics.winRate * 100 * 0.4;
  const penalty = Math.max(0, 10 - analytics.positions.length) * 2;
  return Math.max(0, base - penalty);
}
