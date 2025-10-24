import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('schedule_jobs')
export class ScheduleJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workspaceId: string;

  @Column()
  tenantId: string;

  @Column()
  workflowId: string;

  @Column()
  name: string;

  @Column()
  cronExpression: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('json', { nullable: true })
  triggerData: any;

  @Column({ nullable: true })
  lastExecution: Date;

  @Column({ nullable: true })
  nextExecution: Date;

  @Column({ default: 0 })
  executionCount: number;

  @Column({ default: 0 })
  failureCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
