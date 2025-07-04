import { DataSource } from 'typeorm';
import { Service } from '../entities/Service.js';
import { Project } from '../entities/Project.js';
import { Testimonial } from '../entities/Testimonial.js';
import { Media } from '../entities/Media.js';
import { createLogger } from '@pixora-craftt/shared/utils/logger.js';

const logger = createLogger('cms-database');

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'pixora_user',
  password: process.env.DATABASE_PASSWORD || 'pixora_password',
  database: process.env.DATABASE_NAME || 'pixora_craftt',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [Service, Project, Testimonial, Media],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  extra: {
    max: 20,
    min: 5,
    acquire: 60000,
    idle: 10000,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  }
});

export async function setupDatabase(): Promise<DataSource> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('CMS database connection established successfully');
      
      if (process.env.NODE_ENV === 'production') {
        await AppDataSource.runMigrations();
        logger.info('CMS database migrations completed');
      }
    }
    
    return AppDataSource;
  } catch (error) {
    logger.error('Failed to connect to CMS database', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('CMS database connection closed');
    }
  } catch (error) {
    logger.error('Error closing CMS database connection', error);
    throw error;
  }
} 