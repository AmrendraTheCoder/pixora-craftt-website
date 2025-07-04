import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

@Entity('services')
@Index(['slug'], { unique: true })
@Index(['isActive'])
export class Service {
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

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image?: string;

  @Column({ type: 'json', nullable: true })
  features?: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  priceUnit?: string;

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
      icon: this.icon,
      image: this.image,
      features: this.features || [],
      price: this.price,
      priceUnit: this.priceUnit,
      isFeatured: this.isFeatured,
      sortOrder: this.sortOrder,
      metadata: this.metadata || {},
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
} 