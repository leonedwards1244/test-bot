import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity({ name: 'tracked_wallets' })
export class TrackedWallet {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column()
  walletAddress!: string;

  @Column({ default: 'active' })
  status!: string;

  @Column({ nullable: true })
  label?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity({ name: 'trader_scores' })
export class TraderScore {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  walletAddress!: string;

  @Column('float', { default: 0 })
  score!: number;

  @Column('jsonb', { nullable: true })
  metrics?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity({ name: 'user_preferences' })
export class UserPreference {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  telegramUserId!: string;

  @Column({ default: false })
  copyTradingEnabled!: boolean;

  @Column({ default: 'standard' })
  riskProfile!: string;

  @Column('jsonb', { nullable: true })
  stealthConfig?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
