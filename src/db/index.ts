import { DataSource } from 'typeorm';
import { config } from '../utils/config';
import { TrackedWallet, TraderScore, UserPreference } from './schemas';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.database.url,
  synchronize: false,
  logging: false,
  entities: [TrackedWallet, TraderScore, UserPreference]
});

export async function initializeDatabase(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}
