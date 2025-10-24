import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('circuit_breakers')
export class CircuitBreaker {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  serviceName: string;

  @Column()
  workspaceId: string;

  @Column()
  tenantId: string;

  @Column({ default: 'closed' })
  state: 'closed' | 'open' | 'half-open';

  @Column({ default: 0 })
  failureCount: number;

  @Column({ default: 5 })
  failureThreshold: number;

  @Column({ default: 60000 })
  timeout: number;

  @Column({ nullable: true })
  lastFailureTime: Date;

  @Column({ nullable: true })
  nextAttemptTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
