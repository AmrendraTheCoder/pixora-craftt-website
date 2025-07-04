import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { createLogger } from '../utils/logger.js';
import { ApiResponse } from '../types/common.js';
import { Contact } from '../config/database.js';
import rateLimit from 'express-rate-limit';

const logger = createLogger('contact-routes');
const router = Router();

// Rate limiting for contact submissions
const contactSubmissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 contact form submissions per hour per IP
  message: {
    success: false,
    error: 'Too many contact submissions. Please try again later.'
  }
});

// Submit contact form (public endpoint)
router.post('/submit',
  contactSubmissionLimiter,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('subject')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Subject must be between 5 and 200 characters'),
    body('message')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Message must be between 10 and 2000 characters'),
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

      const { name, email, subject, message } = req.body;
      const database = req.database;

      if (!database) {
        logger.error('Database not available for contact submission');
        return res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable'
        });
      }

      const contactRepo = database.getRepository(Contact);
      
      const contact = contactRepo.create({
        name,
        email,
        subject,
        message,
        status: 'new',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await contactRepo.save(contact);

      logger.info('Contact form submitted', {
        contactId: contact.id,
        email,
        subject: subject.substring(0, 50) + '...'
      });

      const response: ApiResponse = {
        success: true,
        message: 'Contact form submitted successfully',
        data: { contactId: contact.id }
      };

      res.status(201).json(response);

    } catch (error) {
      logger.error('Failed to submit contact form', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to submit contact form'
      };
      res.status(500).json(response);
    }
  }
);

// Get all contacts (admin only)
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['new', 'read', 'replied', 'closed']).withMessage('Invalid status'),
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

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;

      const contactRepo = database.getRepository(Contact);
      const queryBuilder = contactRepo.createQueryBuilder('contact');

      if (status) {
        queryBuilder.where('contact.status = :status', { status });
      }

      const [contacts, total] = await queryBuilder
        .orderBy('contact.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const response: ApiResponse = {
        success: true,
        data: {
          contacts,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

      res.json(response);

    } catch (error) {
      logger.error('Failed to fetch contacts', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch contacts'
      };
      res.status(500).json(response);
    }
  }
);

// Get single contact (admin only)
router.get('/:id',
  async (req: Request, res: Response) => {
    try {
      const contactId = parseInt(req.params.id);
      if (!contactId || contactId <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid contact ID'
        });
      }

      const database = req.database;
      if (!database) {
        return res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable'
        });
      }

      const contactRepo = database.getRepository(Contact);
      const contact = await contactRepo.findOne({ where: { id: contactId } });

      if (!contact) {
        return res.status(404).json({
          success: false,
          error: 'Contact not found'
        });
      }

      const response: ApiResponse = {
        success: true,
        data: { contact }
      };

      res.json(response);

    } catch (error) {
      logger.error('Failed to fetch contact', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch contact'
      };
      res.status(500).json(response);
    }
  }
);

// Update contact status (admin only)
router.patch('/:id/status',
  [
    body('status')
      .isIn(['new', 'read', 'replied', 'closed'])
      .withMessage('Invalid status')
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

      const contactId = parseInt(req.params.id);
      if (!contactId || contactId <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid contact ID'
        });
      }

      const { status } = req.body;
      const database = req.database;

      if (!database) {
        return res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable'
        });
      }

      const contactRepo = database.getRepository(Contact);
      const contact = await contactRepo.findOne({ where: { id: contactId } });

      if (!contact) {
        return res.status(404).json({
          success: false,
          error: 'Contact not found'
        });
      }

      contact.status = status;
      contact.updatedAt = new Date();
      await contactRepo.save(contact);

      logger.info('Contact status updated', {
        contactId,
        oldStatus: contact.status,
        newStatus: status
      });

      const response: ApiResponse = {
        success: true,
        message: 'Contact status updated successfully',
        data: { contact }
      };

      res.json(response);

    } catch (error) {
      logger.error('Failed to update contact status', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to update contact status'
      };
      res.status(500).json(response);
    }
  }
);

// Delete contact (admin only)
router.delete('/:id',
  async (req: Request, res: Response) => {
    try {
      const contactId = parseInt(req.params.id);
      if (!contactId || contactId <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid contact ID'
        });
      }

      const database = req.database;
      if (!database) {
        return res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable'
        });
      }

      const contactRepo = database.getRepository(Contact);
      const contact = await contactRepo.findOne({ where: { id: contactId } });

      if (!contact) {
        return res.status(404).json({
          success: false,
          error: 'Contact not found'
        });
      }

      await contactRepo.remove(contact);

      logger.info('Contact deleted', { contactId });

      const response: ApiResponse = {
        success: true,
        message: 'Contact deleted successfully'
      };

      res.json(response);

    } catch (error) {
      logger.error('Failed to delete contact', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to delete contact'
      };
      res.status(500).json(response);
    }
  }
);

export { router as contactRoutes }; 