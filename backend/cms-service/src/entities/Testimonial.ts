import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

@Entity('testimonials')
@Index(['isActive'])
export class Testimonial {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  clientName!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  clientTitle?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  clientCompany?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  clientAvatar?: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'integer', default: 5 })
  rating!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  projectTitle?: string;

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
      clientName: this.clientName,
      clientTitle: this.clientTitle,
      clientCompany: this.clientCompany,
      clientAvatar: this.clientAvatar,
      content: this.content,
      rating: this.rating,
      projectTitle: this.projectTitle,
      isFeatured: this.isFeatured,
      sortOrder: this.sortOrder,
      metadata: this.metadata || {},
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
} 