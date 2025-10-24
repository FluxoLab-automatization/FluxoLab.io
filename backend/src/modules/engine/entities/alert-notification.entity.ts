import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('alert_notifications')
export class AlertNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  alertId: string;

  @Column()
  workspaceId: string;

  @Column()
  tenantId: string;

  @Column()
  channelType: 'email' | 'slack' | 'webhook' | 'sms';

  @Column()
  channelConfig: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sentCount: number;

  @Column({ nullable: true })
  lastSent: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
