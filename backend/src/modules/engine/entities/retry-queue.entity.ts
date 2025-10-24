import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('retry_queue')
@Index(['nextRetryAt'])
@Index(['runId'])
export class RetryQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  runId: string;

  @Column({ type: 'uuid' })
  stepId: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'int', default: 3 })
  maxRetries: number;

  @Column({ type: 'timestamp with time zone' })
  nextRetryAt: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', default: '{}' })
  errorDetails: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}
