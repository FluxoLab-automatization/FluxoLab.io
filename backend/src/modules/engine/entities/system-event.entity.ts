import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('system_events')
@Index(['eventType'])
@Index(['tenantId'])
@Index(['workspaceId'])
@Index(['runId'])
@Index(['correlationId'])
@Index(['traceId'])
@Index(['created_at'])
export class SystemEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  eventType: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid', nullable: true })
  workspaceId: string;

  @Column({ type: 'uuid', nullable: true })
  runId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  correlationId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  traceId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  spanId: string;

  @Column({ type: 'jsonb', default: '{}' })
  payload: Record<string, any>;

  @Column({ type: 'varchar', length: 64 })
  checksum: string;

  @CreateDateColumn()
  created_at: Date;
}
