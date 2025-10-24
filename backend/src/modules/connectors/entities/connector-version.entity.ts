import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique } from 'typeorm';

@Entity('connector_versions')
@Index(['connectorId'])
@Index(['isActive'])
@Unique(['connectorId', 'version'])
export class ConnectorVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  connectorId: string;

  @Column({ type: 'varchar', length: 20 })
  version: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  changelog: string;

  @Column({ type: 'jsonb', default: '{}' })
  configSchema: Record<string, any>;

  @Column({ type: 'jsonb', default: '{}' })
  authSchema: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}
