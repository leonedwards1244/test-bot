import { fetchWalletPositions } from '../blockchain/polymarket';
import { TraderScore } from '../db/schemas';
import { AppDataSource } from '../db';

export async function refreshTraderScore(walletAddress: string): Promise<TraderScore> {
  const analytics = await fetchWalletPositions(walletAddress);
  const score = computeScore(analytics.totalPnl, analytics.winRate, analytics.positions.length);
  const scoreRepo = AppDataSource.getRepository(TraderScore);
  let record = await scoreRepo.findOneBy({ walletAddress });
  const metrics = analytics as unknown as Record<string, unknown>;

  if (!record) {
    record = scoreRepo.create({ walletAddress, score, metrics });
  } else {
    record.score = score;
    record.metrics = metrics;
  }

  return scoreRepo.save(record);
}

export function computeScore(totalPnl: number, winRate: number, positionCount: number): number {
  const momentum = Math.tanh(totalPnl / 10) * 50;
  const consistency = winRate * 50;
  const activity = Math.min(positionCount, 20) * 2;
  return Number((momentum + consistency + activity).toFixed(2));
}
