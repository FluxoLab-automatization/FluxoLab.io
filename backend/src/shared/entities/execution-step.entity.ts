import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Execution } from './execution.entity';

@Entity('execution_steps')
export class ExecutionStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  executionId: string;

  @Column()
  nodeId: string;

  @Column()
  nodeName: string;

  @Column()
  nodeType: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'skipped';

  @Column('json', { nullable: true })
  inputItems: any;

  @Column('json', { nullable: true })
  outputItems: any;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  finishedAt: Date;

  @Column({ nullable: true })
  errorMessage: string;

  @Column('json', { nullable: true })
  metadata: any;

  @ManyToOne(() => Execution, execution => execution.steps)
  @JoinColumn({ name: 'executionId' })
  execution: Execution;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
