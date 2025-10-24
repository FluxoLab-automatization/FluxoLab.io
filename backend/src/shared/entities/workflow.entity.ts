import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Execution } from './execution.entity';
import { WorkflowVersion } from './workflow-version.entity';

@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  workspaceId: string;

  @Column()
  tenantId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPublic: boolean;

  @Column('json', { nullable: true })
  tags: string[];

  @Column('json', { nullable: true })
  metadata: any;

  @Column({ nullable: true })
  activeVersionId: string;

  @OneToMany(() => Execution, execution => execution.workflow)
  executions: Execution[];

  @OneToMany(() => WorkflowVersion, version => version.workflow)
  versions: WorkflowVersion[];

  @ManyToOne(() => WorkflowVersion, version => version.id)
  @JoinColumn({ name: 'activeVersionId' })
  activeVersion: WorkflowVersion;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
