import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('alert_history')
@Index(['alertId', 'createdAt'])
@Index(['workspaceId', 'createdAt'])
export class AlertHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  alertId: string;

  @Column()
  workspaceId: string;

  @Column()
  tenantId: string;

  @Column()
  status: 'triggered' | 'resolved' | 'acknowledged';

  @Column('json')
  alertData: any;

  @Column('json', { nullable: true })
  resolutionData: any;

  @Column({ nullable: true })
  acknowledgedBy: string;

  @Column({ nullable: true })
  acknowledgedAt: Date;

  @Column({ nullable: true })
  resolvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
