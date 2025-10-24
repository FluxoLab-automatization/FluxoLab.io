import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique } from 'typeorm';

@Entity('idempotency_keys')
@Index(['scope'])
@Index(['expiresAt'])
@Index(['workspaceId'])
@Unique(['tenantId', 'workspaceId', 'scope', 'key'])
export class IdempotencyKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  workspaceId: string;

  @Column({ type: 'varchar', length: 100 })
  scope: string;

  @Column({ type: 'varchar', length: 255 })
  key: string;

  @Column({ type: 'uuid', nullable: true })
  runId: string;

  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date;

  @CreateDateColumn()
  created_at: Date;
}
