import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TemplateVersion } from './template-version.entity';

@Entity('template_params')
export class TemplateParam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  templateVersionId: string;

  @Column({ nullable: true })
  templateId: string;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column({ default: false })
  isRequired: boolean;

  @Column({ nullable: true })
  defaultValue: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  displayOrder: number;

  @Column('json', { nullable: true })
  validation: any;

  @ManyToOne(() => TemplateVersion, version => version.params)
  @JoinColumn({ name: 'templateVersionId' })
  templateVersion: TemplateVersion;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
