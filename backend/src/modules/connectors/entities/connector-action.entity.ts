import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('connector_actions')
@Index(['connectorId'])
@Index(['actionType'])
@Index(['isActive'])
export class ConnectorAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  connectorId: string;

  @Column({ type: 'varchar', length: 100 })
  actionName: string;

  @Column({ type: 'varchar', length: 50 })
  actionType: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: '{}' })
  inputSchema: Record<string, any>;

  @Column({ type: 'jsonb', default: '{}' })
  outputSchema: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
