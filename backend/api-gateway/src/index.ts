import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { createProxyMiddleware } from 'http-proxy-middleware';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
import { createLogger } from '@pixora-craftt/shared/utils/logger.js';
import { createAuthMiddleware } from '@pixora-craftt/shared/middleware/auth.js';
import { ApiResponse, HealthCheck } from '@pixora-craftt/shared/types/common.js';
import { setupRoutes } from './routes/index.js';
import { setupMiddleware } from './middleware/index.js';
import { HealthService } from './services/health.js';
import { LoadBalancer } from './services/loadBalancer.js';
import { MetricsService } from './services/metrics.js';

// Load environment variables
dotenv.config();

const logger = createLogger('api-gateway');
const app = express();
const PORT = process.env.API_GATEWAY_PORT || 4000;

// Service endpoints
const services = {
  auth: {
    url: process.env.AUTH_SERVICE_URL || `http://localhost:${process.env.AUTH_SERVICE_PORT || 4001}`,
    healthPath: '/health'
  },
  cms: {
    url: process.env.CMS_SERVICE_URL || `http://localhost:${process.env.CMS_SERVICE_PORT || 4002}`,
    healthPath: '/health'
  },
  admin: {
    url: process.env.ADMIN_SERVICE_URL || `http://localhost:${process.env.ADMIN_SERVICE_PORT || 4003}`,
    healthPath: '/health'
  }
};

// Initialize services
const healthService = new HealthService(services);
const loadBalancer = new LoadBalancer(services);
const metricsService = new MetricsService();
const authMiddleware = createAuthMiddleware(process.env.JWT_SECRET!);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pixora Craftt API',
      version: '1.0.0',
      description: 'API documentation for Pixora Craftt microservices platform',
      contact: {
        name: 'Pixora Craftt Team',
        email: 'support@pixoracraftt.com'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/docs/*.yml']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => {
      logger.info(message.trim());
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Speed limiting (gradual slowdown)
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per windowMs without delay
  delayMs: 500 // Add 500ms delay per request after delayAfter
});

app.use('/api', limiter, speedLimiter);

// Request ID middleware for tracing
app.use((req, res, next) => {
  req.id = require('uuid').v4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    metricsService.recordRequest(req.method, req.path, res.statusCode, duration);
  });
  
  next();
});

// Setup custom middleware
setupMiddleware(app);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const health = await healthService.getOverallHealth();
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

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    const metrics = await metricsService.getMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Metrics endpoint failed', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve metrics'
    });
  }
});

// API Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Pixora Craftt API Documentation'
}));

// Serve OpenAPI spec
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

// Service proxies with load balancing
app.use('/api/auth', createProxyMiddleware({
  target: loadBalancer.getService('auth'),
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': ''
  },
  onError: (err, req, res) => {
    logger.error('Auth service proxy error', err);
    loadBalancer.markServiceUnhealthy('auth');
    res.status(503).json({
      success: false,
      error: 'Auth service unavailable'
    });
  }
}));

app.use('/api/cms', createProxyMiddleware({
  target: loadBalancer.getService('cms'),
  changeOrigin: true,
  pathRewrite: {
    '^/api/cms': ''
  },
  onError: (err, req, res) => {
    logger.error('CMS service proxy error', err);
    loadBalancer.markServiceUnhealthy('cms');
    res.status(503).json({
      success: false,
      error: 'CMS service unavailable'
    });
  }
}));

app.use('/api/admin', createProxyMiddleware({
  target: loadBalancer.getService('admin'),
  changeOrigin: true,
  pathRewrite: {
    '^/api/admin': ''
  },
  onError: (err, req, res) => {
    logger.error('Admin service proxy error', err);
    loadBalancer.markServiceUnhealthy('admin');
    res.status(503).json({
      success: false,
      error: 'Admin service unavailable'
    });
  }
}));

// Setup API routes
setupRoutes(app, { authMiddleware, healthService, metricsService });

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
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.userId
  });

  const response: ApiResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  };

  res.status(500).json(response);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  // Close server
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`API Documentation: http://localhost:${PORT}/docs`);
  logger.info(`Metrics: http://localhost:${PORT}/metrics`);
});

// Start health monitoring
healthService.startMonitoring();

export default app; 