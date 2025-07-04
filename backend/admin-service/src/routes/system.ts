import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { createLogger } from '@pixora-craftt/shared/utils/logger.js';
import { ApiResponse } from '@pixora-craftt/shared/types/common.js';
import { SystemLog } from '../config/database.js';
import os from 'os';
import fs from 'fs/promises';
import path from 'path';

const logger = createLogger('system-routes');
const router = Router();

// Get system health and metrics (admin only)
router.get('/health',
  async (req: Request, res: Response) => {
    try {
      const database = req.database;

      // Gather system metrics
      const systemMetrics = {
        timestamp: new Date(),
        uptime: {
          process: process.uptime(),
          system: os.uptime()
        },
        memory: {
          process: {
            used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
            total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
            external: Math.round((process.memoryUsage().external / 1024 / 1024) * 100) / 100,
            rss: Math.round((process.memoryUsage().rss / 1024 / 1024) * 100) / 100
          },
          system: {
            total: Math.round((os.totalmem() / 1024 / 1024 / 1024) * 100) / 100,
            free: Math.round((os.freemem() / 1024 / 1024 / 1024) * 100) / 100,
            used: Math.round(((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024) * 100) / 100
          }
        },
        cpu: {
          cores: os.cpus().length,
          architecture: os.arch(),
          platform: os.platform(),
          loadAverage: os.loadavg()
        },
        database: {
          connected: database?.isInitialized || false,
          responseTime: null as number | null
        },
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          pid: process.pid
        }
      };

      // Test database connection
      if (database?.isInitialized) {
        try {
          const start = Date.now();
          await database.query('SELECT 1');
          systemMetrics.database.responseTime = Date.now() - start;
        } catch (error) {
          systemMetrics.database.connected = false;
          logger.error('Database health check failed', error);
        }
      }

      const response: ApiResponse = {
        success: true,
        data: systemMetrics
      };

      res.json(response);

    } catch (error) {
      logger.error('Failed to get system health', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get system health'
      };
      res.status(500).json(response);
    }
  }
);

// Get system logs (admin only)
router.get('/logs',
  [
    query('level')
      .optional()
      .isIn(['info', 'warn', 'error', 'debug'])
      .withMessage('Invalid log level'),
    query('service')
      .optional()
      .isString()
      .withMessage('Service must be a string'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          data: { errors: errors.array() }
        };
        return res.status(400).json(response);
      }

      const database = req.database;
      if (!database) {
        return res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable'
        });
      }

      const level = req.query.level as string;
      const service = req.query.service as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const logRepo = database.getRepository(SystemLog);
      const queryBuilder = logRepo.createQueryBuilder('log');

      if (level) {
        queryBuilder.where('log.level = :level', { level });
      }

      if (service) {
        const condition = level ? 'andWhere' : 'where';
        queryBuilder[condition]('log.service = :service', { service });
      }

      if (startDate) {
        const condition = level || service ? 'andWhere' : 'where';
        queryBuilder[condition]('log.createdAt >= :startDate', { startDate });
      }

      if (endDate) {
        const condition = level || service || startDate ? 'andWhere' : 'where';
        queryBuilder[condition]('log.createdAt <= :endDate', { endDate });
      }

      const [logs, total] = await queryBuilder
        .orderBy('log.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const response: ApiResponse = {
        success: true,
        data: {
          logs,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          },
          filters: {
            level,
            service,
            startDate,
            endDate
          }
        }
      };

      res.json(response);

    } catch (error) {
      logger.error('Failed to fetch system logs', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch system logs'
      };
      res.status(500).json(response);
    }
  }
);

// Add system log entry (internal endpoint)
router.post('/logs',
  [
    body('level')
      .isIn(['info', 'warn', 'error', 'debug'])
      .withMessage('Invalid log level'),
    body('message')
      .isString()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Message must be between 1 and 1000 characters'),
    body('service')
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Service must be between 1 and 100 characters'),
    body('data')
      .optional()
      .isObject()
      .withMessage('Data must be an object'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          data: { errors: errors.array() }
        };
        return res.status(400).json(response);
      }

      const { level, message, service, data } = req.body;
      const database = req.database;

      if (!database) {
        return res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable'
        });
      }

      const logRepo = database.getRepository(SystemLog);
      
      const logEntry = logRepo.create({
        level,
        message,
        service,
        data: data || {},
        createdAt: new Date()
      });

      await logRepo.save(logEntry);

      const response: ApiResponse = {
        success: true,
        message: 'Log entry created successfully',
        data: { logId: logEntry.id }
      };

      res.status(201).json(response);

    } catch (error) {
      logger.error('Failed to create log entry', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to create log entry'
      };
      res.status(500).json(response);
    }
  }
);

// Get service status overview (admin only)
router.get('/services',
  async (req: Request, res: Response) => {
    try {
      const services = [
        { name: 'api-gateway', port: process.env.API_GATEWAY_PORT || 4000 },
        { name: 'auth-service', port: process.env.AUTH_SERVICE_PORT || 4001 },
        { name: 'cms-service', port: process.env.CMS_SERVICE_PORT || 4002 },
        { name: 'admin-service', port: process.env.ADMIN_SERVICE_PORT || 4003 }
      ];

      const serviceChecks = await Promise.allSettled(
        services.map(async (service) => {
          try {
            const response = await fetch(`http://localhost:${service.port}/health`, {
              timeout: 5000
            });
            
            if (response.ok) {
              const healthData = await response.json();
              return {
                name: service.name,
                port: service.port,
                status: 'healthy',
                responseTime: Date.now(),
                details: healthData
              };
            } else {
              return {
                name: service.name,
                port: service.port,
                status: 'unhealthy',
                error: `HTTP ${response.status}`
              };
            }
          } catch (error) {
            return {
              name: service.name,
              port: service.port,
              status: 'unreachable',
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );

      const serviceStatuses = serviceChecks.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            name: services[index].name,
            port: services[index].port,
            status: 'error',
            error: result.reason?.message || 'Health check failed'
          };
        }
      });

      const overallHealth = serviceStatuses.every(s => s.status === 'healthy');

      const response: ApiResponse = {
        success: true,
        data: {
          overallHealth,
          services: serviceStatuses,
          timestamp: new Date()
        }
      };

      res.json(response);

    } catch (error) {
      logger.error('Failed to check service statuses', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to check service statuses'
      };
      res.status(500).json(response);
    }
  }
);

// Clear old logs (admin only)
router.delete('/logs/cleanup',
  [
    body('days')
      .isInt({ min: 1, max: 365 })
      .withMessage('Days must be between 1 and 365'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          data: { errors: errors.array() }
        };
        return res.status(400).json(response);
      }

      const { days } = req.body;
      const database = req.database;

      if (!database) {
        return res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable'
        });
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const logRepo = database.getRepository(SystemLog);
      const result = await logRepo
        .createQueryBuilder()
        .delete()
        .where('createdAt < :cutoffDate', { cutoffDate })
        .execute();

      logger.info('Log cleanup completed', {
        deletedCount: result.affected,
        cutoffDate,
        days
      });

      const response: ApiResponse = {
        success: true,
        message: `Deleted ${result.affected} log entries older than ${days} days`,
        data: {
          deletedCount: result.affected,
          cutoffDate,
          days
        }
      };

      res.json(response);

    } catch (error) {
      logger.error('Failed to cleanup logs', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to cleanup logs'
      };
      res.status(500).json(response);
    }
  }
);

export { router as systemRoutes }; 