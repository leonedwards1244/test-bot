import axios from 'axios';
import { config } from '../utils/config';
import { logger } from '../utils/logger';

export interface PolymarketPosition {
  marketId: string;
  positionId: string;
  side: 'YES' | 'NO';
  size: number;
  pnl: number;
  probability: number;
  timestamp: string;
}

export interface PolymarketWalletAnalytics {
  walletAddress: string;
  positions: PolymarketPosition[];
  totalPnl: number;
  winRate: number;
}

export async function fetchWalletPositions(walletAddress: string): Promise<PolymarketWalletAnalytics> {
  try {
    const url = `${config.polymarket.apiUrl}/positions?wallet=${encodeURIComponent(walletAddress)}`;
    logger.debug('Fetching Polymarket wallet positions', { url, walletAddress });
    const response = await axios.get<{ data: PolymarketPosition[] }>(url, { timeout: 12000 });
    const positions = response.data.data || [];
    const totalPnl = positions.reduce((sum, position) => sum + position.pnl, 0);
    const winRate = positions.length ? positions.filter((p) => p.pnl > 0).length / positions.length : 0;
    return { walletAddress, positions, totalPnl, winRate };
  } catch (error) {
    logger.error('Polymarket fetch failed', { error, walletAddress });
    throw error;
  }
}
