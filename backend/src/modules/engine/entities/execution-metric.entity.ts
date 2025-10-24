import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('execution_metrics')
@Index(['workspaceId', 'tenantId', 'createdAt'])
@Index(['workflowId', 'createdAt'])
export class ExecutionMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workspaceId: string;

  @Column()
  tenantId: string;

  @Column()
  workflowId: string;

  @Column({ nullable: true })
  runId: string;

  @Column()
  metricType: 'execution_time' | 'memory_usage' | 'cpu_usage' | 'error_rate' | 'throughput';

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column({ nullable: true })
  unit: string;

  @Column('json', { nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;
}
