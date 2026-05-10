import dotenv from 'dotenv';

dotenv.config();

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = value ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const config = {
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN || '',
    adminIds: process.env.TELEGRAM_ADMIN_IDS?.split(',').map((id) => id.trim()) || []
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/solopoly'
  },
  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    wsUrl: process.env.SOLANA_WS_URL || 'wss://api.mainnet-beta.solana.com',
    baseFeeLamports: parseNumber(process.env.SOLANA_BASE_FEE_LAMPORTS, 5000)
  },
  layerzero: {
    apiUrl: process.env.LAYERZERO_API_URL || '',
    feePayerPrivateKey: process.env.LAYERZERO_FEE_PAYER_PRIVATE_KEY || '',
    chainIds: process.env.LAYERZERO_CHAIN_IDS?.split(',').map((chain) => chain.trim()) || ['1', '137', '56']
  },
  polymarket: {
    apiUrl: process.env.POLYMARKET_API_URL || 'https://polymarket.com/api'
  },
  analytics: {
    lookbackDays: parseNumber(process.env.PERFORMANCE_SCORE_LOOKBACK_DAYS, 30)
  },
  rateLimit: {
    requestsPerMinute: parseNumber(process.env.REQUESTS_PER_MINUTE, 30)
  }
};
