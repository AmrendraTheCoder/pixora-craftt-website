import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { createLogger } from '@pixora-craftt/shared/utils/logger.js';
import { ApiResponse } from '@pixora-craftt/shared/types/common.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { setupDatabase } from './config/database.js';
import { RedisService } from './services/redis.js';
import { EmailService } from './services/email.js';

// Load environment variables
dotenv.config();

const logger = createLogger('auth-service');
const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 4001;

// Global services
let database: DataSource;
let redisService: RedisService;
let emailService: EmailService;

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
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window for auth endpoints
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window for general endpoints
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  }
});

// Apply rate limiting
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
app.use('/auth/forgot-password', authLimiter);
app.use('/auth/reset-password', authLimiter);
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
      service: 'auth-service',
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
      },
      redis: {
        connected: redisService?.isConnected() || false
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

    // Check Redis connection
    if (redisService?.isConnected()) {
      try {
        const start = Date.now();
        await redisService.ping();
        health.redis = { connected: true, responseTime: Date.now() - start };
      } catch (error) {
        health.status = 'degraded';
        health.redis = { connected: false };
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

// Make services available to routes
app.use((req, res, next) => {
  req.database = database;
  req.redisService = redisService;
  req.emailService = emailService;
  next();
});

// API routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

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
  logger.error('Unhandled error in auth service', {
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

    // Initialize Redis
    redisService = new RedisService();
    await redisService.connect();
    logger.info('Redis connected successfully');

    // Initialize email service
    emailService = new EmailService();
    logger.info('Email service initialized');

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Auth service running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      
      server.close(async () => {
        try {
          await database?.destroy();
          await redisService?.disconnect();
          logger.info('Auth service shut down complete');
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
    logger.error('Failed to start auth service', error);
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