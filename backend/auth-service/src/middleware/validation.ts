import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse } from '@pixora-craftt/shared/types/common.js';
import { createLogger } from '@pixora-craftt/shared/utils/logger.js';

const logger = createLogger('auth-validation');

export function validate(schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = source === 'body' ? req.body : 
                           source === 'query' ? req.query : 
                           req.params;

      const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false, // Get all errors, not just the first one
        stripUnknown: true, // Remove unknown fields
        convert: true // Convert strings to numbers, etc.
      });

      if (error) {
        const validationErrors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        logger.warn('Validation failed', {
          url: req.url,
          method: req.method,
          errors: validationErrors,
          source
        });

        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          details: {
            errors: validationErrors
          }
        };

        return res.status(400).json(response);
      }

      // Replace the original data with the validated (and potentially converted) data
      if (source === 'body') {
        req.body = value;
      } else if (source === 'query') {
        req.query = value;
      } else {
        req.params = value;
      }

      next();
    } catch (validationError) {
      logger.error('Validation middleware error', {
        error: validationError,
        url: req.url,
        method: req.method
      });

      const response: ApiResponse = {
        success: false,
        error: 'Internal validation error'
      };

      return res.status(500).json(response);
    }
  };
}

// Specific validation functions for different request parts
export const validateBody = (schema: Joi.ObjectSchema) => validate(schema, 'body');
export const validateQuery = (schema: Joi.ObjectSchema) => validate(schema, 'query');
export const validateParams = (schema: Joi.ObjectSchema) => validate(schema, 'params');

// Custom validation helpers
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function sanitizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

// File upload validation
export function validateFileUpload(
  allowedTypes: string[],
  maxSize: number = 5 * 1024 * 1024 // 5MB default
) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next();
    }

    // Check file type
    if (!allowedTypes.includes(req.file.mimetype)) {
      const response: ApiResponse = {
        success: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      };
      return res.status(400).json(response);
    }

    // Check file size
    if (req.file.size > maxSize) {
      const response: ApiResponse = {
        success: false,
        error: `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`
      };
      return res.status(400).json(response);
    }

    next();
  };
}

// Rate limiting validation
export function validateRateLimit(req: Request, res: Response, next: NextFunction) {
  // Check if rate limit headers are present
  const remaining = parseInt(res.get('X-RateLimit-Remaining') || '0');
  const limit = parseInt(res.get('X-RateLimit-Limit') || '0');
  
  if (remaining === 0) {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      limit,
      remaining
    });
  }
  
  next();
}

// IP whitelist validation
export function validateIPWhitelist(allowedIPs: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || '';
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      logger.warn('IP address not whitelisted', {
        ip: clientIP,
        url: req.url,
        method: req.method,
        allowedIPs
      });

      const response: ApiResponse = {
        success: false,
        error: 'Access denied from this IP address'
      };
      return res.status(403).json(response);
    }
    
    next();
  };
} 