import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('compensation_actions')
export class CompensationAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  runId: string;

  @Column()
  stepId: string;

  @Column()
  actionType: string;

  @Column('json')
  actionData: any;

  @Column({ default: 'pending' })
  status: 'pending' | 'executed' | 'failed';

  @Column({ nullable: true })
  executedAt: Date;

  @Column({ nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
