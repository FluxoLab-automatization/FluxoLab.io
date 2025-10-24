import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique } from 'typeorm';

@Entity('distributed_locks')
@Index(['expiresAt'])
@Unique(['lockKey'])
export class DistributedLock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  lockKey: string;

  @Column({ type: 'varchar', length: 100 })
  lockedBy: string;

  @Column({ type: 'timestamp with time zone' })
  lockedAt: Date;

  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date;
}
