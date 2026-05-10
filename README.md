# Solopoly

Solopoly is a modular Telegram copy trading platform built with Node.js and TypeScript. It provides traders with real-time wallet tracking, automated copy trading, cross-chain bridging via LayerZero, stealth wallet features, and analytics for decentralized prediction markets like Polymarket.

## Contents

- [Architecture](#architecture)
- [BotFather Setup](#botfather-setup)
- [Installation](#installation)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Core Components](#core-components)
- [Telegram User Flow](#telegram-user-flow)
- [Deployment](#deployment)
- [Testing](#testing)
- [Maintenance](#maintenance)
- [Roadmap](#roadmap)

## Architecture

Solopoly uses a layered architecture:

- `src/bot` - Telegram command processing and middleware
- `src/blockchain` - Solana, LayerZero, and Polymarket integration
- `src/db` - database schema and persistence
- `src/services` - copy trading, wallet analytics, scoring, and privacy wallet handling
- `src/utils` - logging, config, error handling, and rate limiting

This separation enables security, scalability, and maintenance.

## BotFather Setup

Follow these steps to create the Telegram bot.

1. Open BotFather in Telegram: `@BotFather`
2. Create a new bot:
   - Command: `/newbot`
   - Name: `Solopoly`
   - Username: `SolopolyBot` or similar
3. Configure bot settings:
   - `/setdescription` and enter a short description
   - `/setabouttext` and enter a longer summary
   - `/setuserpic` to upload the provided logo
   - `/setcommands` and paste the commands list below:

```
start - Launch the bot and show available tools
track_wallet - Start wallet tracking and analytics
copy_trade - Configure automated copy trading
bridge_funds - Route Solana payments to another chain
stealth_wallet - Create or manage anonymous wallet mode
performance - Display trader scoring and rankings
help - Show help and security best practices
```

4. Store the token securely in `.env` as `TELEGRAM_BOT_TOKEN`.

## Installation

```bash
cd /workspaces/test-bot
npm install
cp .env.example .env
```

## Configuration

Update `.env` with your own values.

Required variables:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_ADMIN_IDS`
- `DATABASE_URL`
- `SOLANA_RPC_URL`
- `SOLANA_WS_URL`
- `LAYERZERO_API_URL`
- `POLYMARKET_API_URL`

Optional:

- `LAYERZERO_CHAIN_IDS`
- `PERFORMANCE_SCORE_LOOKBACK_DAYS`
- `REQUESTS_PER_MINUTE`

## Project Structure

```
src/
  bot/
    telegram.ts
    commands.ts
    middleware.ts
  blockchain/
    solana.ts
    layerzero.ts
    polymarket.ts
  db/
    index.ts
    schemas.ts
  services/
    copyTrading.ts
    walletTracker.ts
    stealthWallet.ts
    scoring.ts
    rateLimiter.ts
  utils/
    config.ts
    logger.ts
    errors.ts
  index.ts
```

## Core Components

### Telegram Bot

The Telegram module initializes the bot, registers commands, and routes messages through middleware. It includes rate limiting and admin-only actions.

### Solana Integration

Uses `@solana/web3.js` for:

- wallet account monitoring
- transaction signatures
- balance fetching
- submitting payments for copy trades

### LayerZero Bridge Integration

The LayerZero module provides a bridge adapter. It handles fee estimation, payload construction, and sending cross-chain instructions to the bridge coordinator.

### Wallet Tracking & Copy Trading

The wallet tracker stores trader wallet metadata and monitors performance. The copy trading service:

- reads tracked wallet activity
- maps wallet trades into user instructions
- submits Solana-based mirror trades
- uses stealth wallet routing when privacy mode is enabled

### Analytics & Scoring

The scoring algorithm computes performance based on:

- win rate in Polymarket positions
- average ROI
- staking and trade volume
- drawdown and consistency metrics

## Telegram User Flow

1. User sends `/start`
2. Bot replies with menu and key commands
3. User sends `/track_wallet`
   - bot asks for wallet address
   - bot begins wallet analytics
4. User sends `/copy_trade`
   - bot asks for risk profile and target trader
   - bot creates a recurring mirror order
5. User sends `/bridge_funds`
   - bot asks for source amount and destination chain
   - bot calculates LayerZero fees and submits bridge request
6. User sends `/stealth_wallet`
   - bot creates a privacy wallet session
   - bot stores ephemeral keys encrypted in the database

## Deployment

Recommended deployment targets:

- AWS ECS / Fargate
- Google Cloud Run
- DigitalOcean App Platform
- Any container host that supports Node.js

Example Docker commands:

```bash
npm run build
node dist/index.js
```

Cloud Run environment variables:
- Use Cloud Secret Manager for sensitive values: `TELEGRAM_BOT_TOKEN`, `DATABASE_URL`, `LAYERZERO_FEE_PAYER_PRIVATE_KEY`
- Deploy with `gcloud run deploy` and `--set-env-vars` for non-secret values
- Configure these values in `cloudbuild.yaml` or your Cloud Build trigger if you use automated deployment

Add monitoring, logging, and uptime checks to satisfy 99.9% availability.

## Testing

- Unit test service logic with your framework of choice (Jest / Vitest)
- Simulate Telegram commands with recorded inbound payloads
- Test wallet analytics against a Polymarket API sandbox
- Validate Solana transactions on devnet before mainnet deployment

## Maintenance

- Rotate private keys and API keys quarterly
- Review LayerZero endpoint changes and fee models
- Audit database schema and indexes for performance
- Implement health checks for RPC endpoints and bot uptime

## Roadmap

1. MVP: Telegram command handling, Solana wallet analytics, copy trade orchestration
2. Bridge support: LayerZero messaging and cross-chain fee quote
3. Privacy: stealth wallet generation and anonymized routing
4. Scoring: advanced trader ranking and signal feeds
5. Scale: Redis caching, horizontal workers, PostgreSQL performance tuning
