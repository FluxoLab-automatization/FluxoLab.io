import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { TemplateVersion } from './template-version.entity';

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  slug: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ nullable: true })
  vertical: string;

  @Column({ default: 0 })
  installCount: number;

  @Column({ default: 0 })
  rating: number;

  @Column('json', { nullable: true })
  metadata: any;

  @OneToMany(() => TemplateVersion, version => version.template)
  versions: TemplateVersion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
