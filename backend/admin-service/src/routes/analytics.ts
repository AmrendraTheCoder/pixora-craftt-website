import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { createLogger } from '../utils/logger.js';
import { ApiResponse } from '../types/common.js';
import { Analytics } from '../config/database.js';

const logger = createLogger('analytics-routes');
const router = Router();

// Track analytics event (public endpoint)
router.post('/track',
  [
    body('type')
      .isIn(['page_view', 'contact_form', 'project_view', 'service_inquiry'])
      .withMessage('Invalid analytics type'),
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

      const { type, data = {} } = req.body;
      const database = req.database;

      if (!database) {
        logger.error('Database not available for analytics tracking');
        return res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable'
        });
      }

      const analyticsRepo = database.getRepository(Analytics);
      
      const analyticsEvent = analyticsRepo.create({
        type,
        data,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        createdAt: new Date()
      });

      await analyticsRepo.save(analyticsEvent);

      logger.info('Analytics event tracked', {
        type,
        eventId: analyticsEvent.id,
        data: Object.keys(data)
      });

      const response: ApiResponse = {
        success: true,
        message: 'Analytics event tracked successfully',
        data: { eventId: analyticsEvent.id }
      };

      res.status(201).json(response);

    } catch (error) {
      logger.error('Failed to track analytics event', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to track analytics event'
      };
      res.status(500).json(response);
    }
  }
);

// Get analytics overview (admin only)
router.get('/overview',
  [
    query('period')
      .optional()
      .isIn(['today', 'week', 'month', 'year'])
      .withMessage('Invalid period'),
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

      const period = req.query.period as string || 'month';
      const analyticsRepo = database.getRepository(Analytics);

      // Calculate date range
      const now = new Date();
      let startDate = new Date();

      switch (period) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Get total events by type
      const eventsByType = await analyticsRepo
        .createQueryBuilder('analytics')
        .select('analytics.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .where('analytics.createdAt >= :startDate', { startDate })
        .groupBy('analytics.type')
        .getRawMany();

      // Get daily breakdown for charts
      const dailyBreakdown = await analyticsRepo
        .createQueryBuilder('analytics')
        .select('DATE(analytics.createdAt)', 'date')
        .addSelect('analytics.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .where('analytics.createdAt >= :startDate', { startDate })
        .groupBy('DATE(analytics.createdAt), analytics.type')
        .orderBy('DATE(analytics.createdAt)', 'ASC')
        .getRawMany();

      // Get top pages/projects
      const topPages = await analyticsRepo
        .createQueryBuilder('analytics')
        .select('analytics.data', 'data')
        .addSelect('COUNT(*)', 'count')
        .where('analytics.type = :type', { type: 'page_view' })
        .andWhere('analytics.createdAt >= :startDate', { startDate })
        .groupBy('analytics.data')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany();

      // Calculate totals
      const totalEvents = eventsByType.reduce((sum, item) => sum + parseInt(item.count), 0);

      const response: ApiResponse = {
        success: true,
        data: {
          period,
          totalEvents,
          eventsByType,
          dailyBreakdown,
          topPages,
          dateRange: {
            start: startDate,
            end: now
          }
        }
      };

      res.json(response);

    } catch (error) {
      logger.error('Failed to fetch analytics overview', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch analytics overview'
      };
      res.status(500).json(response);
    }
  }
);

// Get detailed analytics (admin only)
router.get('/detailed',
  [
    query('type')
      .optional()
      .isIn(['page_view', 'contact_form', 'project_view', 'service_inquiry'])
      .withMessage('Invalid analytics type'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
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

      const type = req.query.type as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const analyticsRepo = database.getRepository(Analytics);
      const queryBuilder = analyticsRepo.createQueryBuilder('analytics');

      if (type) {
        queryBuilder.where('analytics.type = :type', { type });
      }

      if (startDate) {
        queryBuilder.andWhere('analytics.createdAt >= :startDate', { startDate });
      }

      if (endDate) {
        queryBuilder.andWhere('analytics.createdAt <= :endDate', { endDate });
      }

      const [events, total] = await queryBuilder
        .orderBy('analytics.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const response: ApiResponse = {
        success: true,
        data: {
          events,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          },
          filters: {
            type,
            startDate,
            endDate
          }
        }
      };

      res.json(response);

    } catch (error) {
      logger.error('Failed to fetch detailed analytics', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch detailed analytics'
      };
      res.status(500).json(response);
    }
  }
);

// Get analytics stats (admin only)
router.get('/stats',
  async (req: Request, res: Response) => {
    try {
      const database = req.database;
      if (!database) {
        return res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable'
        });
      }

      const analyticsRepo = database.getRepository(Analytics);

      // Get various statistics
      const [
        totalEvents,
        todayEvents,
        weekEvents,
        monthEvents,
        uniqueVisitors
      ] = await Promise.all([
        analyticsRepo.count(),
        analyticsRepo.count({
          where: {
            createdAt: new Date(new Date().toDateString()) // Today
          }
        }),
        analyticsRepo.count({
          where: {
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }),
        analyticsRepo.count({
          where: {
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }),
        analyticsRepo
          .createQueryBuilder('analytics')
          .select('COUNT(DISTINCT analytics.ipAddress)', 'count')
          .where('analytics.createdAt >= :date', { 
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
          })
          .getRawOne()
      ]);

      const response: ApiResponse = {
        success: true,
        data: {
          totalEvents,
          todayEvents,
          weekEvents,
          monthEvents,
          uniqueVisitors: parseInt(uniqueVisitors.count || '0'),
          timestamp: new Date()
        }
      };

      res.json(response);

    } catch (error) {
      logger.error('Failed to fetch analytics stats', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch analytics stats'
      };
      res.status(500).json(response);
    }
  }
);

export { router as analyticsRoutes }; 