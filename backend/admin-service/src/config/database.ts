import { DataSource } from 'typeorm';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { createLogger } from '@pixora-craftt/shared/utils/logger.js';

const logger = createLogger('admin-db');

// Contact entity for storing contact form submissions
@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 200 })
  subject!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ 
    type: 'enum', 
    enum: ['new', 'read', 'replied', 'closed'],
    default: 'new'
  })
  status!: 'new' | 'read' | 'replied' | 'closed';

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;
}

// Analytics entity for storing website analytics data
@Entity('analytics')
export class Analytics {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ 
    type: 'enum',
    enum: ['page_view', 'contact_form', 'project_view', 'service_inquiry']
  })
  type!: 'page_view' | 'contact_form' | 'project_view' | 'service_inquiry';

  @Column({ type: 'jsonb', default: {} })
  data!: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @CreateDateColumn()
  createdAt!: Date;
}

// System logs entity
@Entity('system_logs')
export class SystemLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ 
    type: 'enum',
    enum: ['info', 'warn', 'error', 'debug']
  })
  level!: 'info' | 'warn' | 'error' | 'debug';

  @Column({ type: 'varchar', length: 1000 })
  message!: string;

  @Column({ type: 'varchar', length: 100 })
  service!: string;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  data?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;
}

export async function setupDatabase(): Promise<DataSource> {
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'pixora_user',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'pixora_craftt',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    entities: [Contact, Analytics, SystemLog],
    migrations: ['dist/migrations/*.js'],
    subscribers: ['dist/subscribers/*.js'],
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    await AppDataSource.initialize();
    logger.info('Admin service database connection established');
    return AppDataSource;
  } catch (error) {
    logger.error('Failed to connect to database', error);
    throw error;
  }
} 