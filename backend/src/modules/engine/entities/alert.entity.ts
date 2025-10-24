import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workspaceId: string;

  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  alertType: 'execution_failure' | 'performance_degradation' | 'resource_usage' | 'custom';

  @Column('json')
  conditions: any;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 'info' })
  severity: 'low' | 'medium' | 'high' | 'critical';

  @Column('json', { nullable: true })
  notificationChannels: any;

  @Column({ default: 0 })
  triggerCount: number;

  @Column({ nullable: true })
  lastTriggered: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
