import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';

@Entity('connection_secrets')
@Index(['connectionId'])
@Index(['secretName'])
@Unique(['connectionId', 'secretName'])
export class ConnectionSecret {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  connectionId: string;

  @Column({ type: 'varchar', length: 100 })
  secretName: string;

  @Column({ type: 'text' })
  secretValue: string;

  @Column({ type: 'boolean', default: true })
  isEncrypted: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
