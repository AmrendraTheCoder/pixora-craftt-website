import { DataSource } from 'typeorm';
import { User } from '../entities/User.js';
import { UserSession } from '../entities/UserSession.js';
import { createLogger } from '@pixora-craftt/shared/utils/logger.js';

const logger = createLogger('auth-database');

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'pixora_user',
  password: process.env.DATABASE_PASSWORD || 'pixora_password',
  database: process.env.DATABASE_NAME || 'pixora_craftt',
  synchronize: process.env.NODE_ENV === 'development', // Only in development
  logging: process.env.NODE_ENV === 'development',
  entities: [User, UserSession],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  extra: {
    max: 20, // Maximum pool size
    min: 5,  // Minimum pool size
    acquire: 60000, // Maximum time to acquire connection
    idle: 10000, // Maximum time connection can be idle
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  }
});

export async function setupDatabase(): Promise<DataSource> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connection established successfully');
      
      // Run migrations in production
      if (process.env.NODE_ENV === 'production') {
        await AppDataSource.runMigrations();
        logger.info('Database migrations completed');
      }
    }
    
    return AppDataSource;
  } catch (error) {
    logger.error('Failed to connect to database', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connection closed');
    }
  } catch (error) {
    logger.error('Error closing database connection', error);
    throw error;
  }
} 