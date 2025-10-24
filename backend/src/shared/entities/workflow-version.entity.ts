import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Workflow } from './workflow.entity';
import { ExecutionStep } from './execution-step.entity';

@Entity('workflow_versions')
export class WorkflowVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workflowId: string;

  @Column()
  version: string;

  @Column({ default: false })
  isActive: boolean;

  @Column('json')
  nodes: any[];

  @Column('json')
  edges: any[];

  @Column('json', { nullable: true })
  settings: any;

  @Column('json', { nullable: true })
  metadata: any;

  @ManyToOne(() => Workflow, workflow => workflow.versions)
  @JoinColumn({ name: 'workflowId' })
  workflow: Workflow;

  @OneToMany(() => ExecutionStep, step => step.execution)
  steps: ExecutionStep[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
