import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

@Entity('projects')
@Index(['slug'], { unique: true })
@Index(['isActive'])
@Index(['category'])
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'varchar', length: 100 })
  category!: string;

  @Column({ type: 'json', nullable: true })
  tags?: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  client?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  projectUrl?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  repositoryUrl?: string;

  @Column({ type: 'date', nullable: true })
  completedDate?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnailImage?: string;

  @Column({ type: 'json', nullable: true })
  images?: string[];

  @Column({ type: 'json', nullable: true })
  technologies?: string[];

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured!: boolean;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Methods
  toPublicObject() {
    return {
      id: this.id,
      title: this.title,
      slug: this.slug,
      description: this.description,
      content: this.content,
      category: this.category,
      tags: this.tags || [],
      client: this.client,
      projectUrl: this.projectUrl,
      repositoryUrl: this.repositoryUrl,
      completedDate: this.completedDate,
      thumbnailImage: this.thumbnailImage,
      images: this.images || [],
      technologies: this.technologies || [],
      isFeatured: this.isFeatured,
      sortOrder: this.sortOrder,
      metadata: this.metadata || {},
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
} 