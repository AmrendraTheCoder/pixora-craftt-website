import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { createLogger } from './utils/logger.js';
import { ApiResponse } from './types/common.js';
import { setupDatabase } from './config/database.js';
import { contactRoutes } from './routes/contact.js';
import { analyticsRoutes } from './routes/analytics.js';
import { systemRoutes } from './routes/system.js';

// Load environment variables
dotenv.config();

const logger = createLogger('admin-service');
const app = express();
const PORT = process.env.ADMIN_SERVICE_PORT || 4003;

// Global services
let database: DataSource;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Request parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window for admin endpoints
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  }
});

app.use('/', generalLimiter);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logRequest(req.method, req.url, res.statusCode, duration);
  });
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const health = {
      service: 'admin-service',
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
        percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
      },
      database: {
        connected: database?.isInitialized || false
      }
    };

    // Check database connection
    if (database?.isInitialized) {
      try {
        await database.query('SELECT 1');
        health.database = { ...health.database, responseTime: Date.now() };
      } catch (error) {
        health.status = 'unhealthy';
        health.database = { connected: false };
      }
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json({
      success: health.status === 'healthy',
      data: health
    });

  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

// Make database available to routes
app.use((req, res, next) => {
  (req as any).database = database;
  next();
});

// API routes
app.use('/contact', contactRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/system', systemRoutes);

// 404 handler
app.use('*', (req, res) => {
  const response: ApiResponse = {
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`
  };
  res.status(404).json(response);
});

// Global error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error in admin service', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });

  const response: ApiResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  };

  res.status(500).json(response);
});

// Initialize services and start server
async function startServer() {
  try {
    // Initialize database
    database = await setupDatabase();
    logger.info('Database connected successfully');

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Admin service running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      
      server.close(async () => {
        try {
          await database?.destroy();
          logger.info('Admin service shut down complete');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', error);
          process.exit(1);
        }
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    });

  } catch (error) {
    logger.error('Failed to start admin service', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app; 