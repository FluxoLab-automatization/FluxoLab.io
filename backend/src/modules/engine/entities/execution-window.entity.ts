import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('execution_windows')
export class ExecutionWindow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workspaceId: string;

  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column()
  cronExpression: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastExecution: Date;

  @Column({ nullable: true })
  nextExecution: Date;

  @Column('json', { nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
