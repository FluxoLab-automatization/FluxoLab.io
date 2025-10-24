import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Workflow } from './workflow.entity';
import { ExecutionStep } from './execution-step.entity';

@Entity('executions')
export class Execution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workflowId: string;

  @Column()
  workspaceId: string;

  @Column()
  tenantId: string;

  @Column({ default: 'queued' })
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

  @Column('json', { nullable: true })
  triggerData: any;

  @Column({ nullable: true })
  correlationId: string;

  @Column({ nullable: true })
  traceId: string;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  finishedAt: Date;

  @Column({ nullable: true })
  errorMessage: string;

  @Column('json', { nullable: true })
  result: any;

  @ManyToOne(() => Workflow, workflow => workflow.executions)
  @JoinColumn({ name: 'workflowId' })
  workflow: Workflow;

  @OneToMany(() => ExecutionStep, step => step.execution)
  steps: ExecutionStep[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
