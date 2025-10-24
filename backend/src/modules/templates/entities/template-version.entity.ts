import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Template } from './template.entity';
import { TemplateParam } from './template-param.entity';

@Entity('template_versions')
export class TemplateVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  templateId: string;

  @Column()
  version: string;

  @Column({ default: false })
  isActive: boolean;

  @Column('json')
  workflowData: any;

  @Column('json', { nullable: true })
  changelog: any;

  @ManyToOne(() => Template, template => template.versions)
  @JoinColumn({ name: 'templateId' })
  template: Template;

  @OneToMany(() => TemplateParam, param => param.templateVersion)
  params: TemplateParam[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
