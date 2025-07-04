import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload, UserRole, ApiResponse } from '../types/common.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('auth-middleware');

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      sessionId?: string;
    }
  }
}

export interface AuthMiddlewareConfig {
  jwtSecret: string;
  requiredRoles?: UserRole[];
  optional?: boolean;
}

export class AuthMiddleware {
  private jwtSecret: string;

  constructor(jwtSecret: string) {
    this.jwtSecret = jwtSecret;
  }

  // Verify JWT token
  authenticate = (optional: boolean = false) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          if (optional) {
            return next();
          }
          return this.sendUnauthorized(res, 'No authorization token provided');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
          const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;
          req.user = decoded;
          req.sessionId = decoded.sessionId;

          logger.logAuthEvent('token_verified', decoded.userId, true, {
            email: decoded.email,
            role: decoded.role
          });

          next();
        } catch (jwtError) {
          logger.logAuthEvent('token_verification_failed', 'unknown', false, {
            error: jwtError instanceof Error ? jwtError.message : 'Invalid token',
            token: token.substring(0, 20) + '...' // Log partial token for debugging
          });

          if (optional) {
            return next();
          }

          if (jwtError instanceof jwt.TokenExpiredError) {
            return this.sendUnauthorized(res, 'Token expired');
          } else if (jwtError instanceof jwt.JsonWebTokenError) {
            return this.sendUnauthorized(res, 'Invalid token');
          } else {
            return this.sendUnauthorized(res, 'Authentication failed');
          }
        }
      } catch (error) {
        logger.error('Authentication middleware error', error);
        return this.sendUnauthorized(res, 'Authentication error');
      }
    };
  };

  // Role-based authorization
  authorize = (requiredRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return this.sendUnauthorized(res, 'Authentication required');
      }

      if (!requiredRoles.includes(req.user.role)) {
        logger.logAuthEvent('authorization_failed', req.user.userId, false, {
          requiredRoles,
          userRole: req.user.role,
          resource: req.originalUrl
        });

        return this.sendForbidden(res, 'Insufficient permissions');
      }

      logger.logAuthEvent('authorization_success', req.user.userId, true, {
        role: req.user.role,
        resource: req.originalUrl
      });

      next();
    };
  };

  // Combined authentication and authorization
  requireAuth = (requiredRoles?: UserRole[]) => {
    return [
      this.authenticate(false),
      ...(requiredRoles ? [this.authorize(requiredRoles)] : [])
    ];
  };

  // Optional authentication (for public endpoints that can benefit from user context)
  optionalAuth = () => {
    return this.authenticate(true);
  };

  // Admin only access
  requireAdmin = () => {
    return this.requireAuth([UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  };

  // Super admin only access
  requireSuperAdmin = () => {
    return this.requireAuth([UserRole.SUPER_ADMIN]);
  };

  // Editor and above access
  requireEditor = () => {
    return this.requireAuth([UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  };

  // Check if user owns resource or has admin privileges
  requireOwnershipOrAdmin = (getUserIdFromResource: (req: Request) => string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return this.sendUnauthorized(res, 'Authentication required');
      }

      const resourceUserId = getUserIdFromResource(req);
      const isOwner = req.user.userId === resourceUserId;
      const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user.role);

      if (!isOwner && !isAdmin) {
        logger.logAuthEvent('ownership_check_failed', req.user.userId, false, {
          resourceUserId,
          resource: req.originalUrl
        });

        return this.sendForbidden(res, 'Access denied');
      }

      next();
    };
  };

  private sendUnauthorized(res: Response, message: string): Response {
    const response: ApiResponse = {
      success: false,
      error: message
    };
    return res.status(401).json(response);
  }

  private sendForbidden(res: Response, message: string): Response {
    const response: ApiResponse = {
      success: false,
      error: message
    };
    return res.status(403).json(response);
  }
}

// Factory function to create auth middleware
export function createAuthMiddleware(jwtSecret: string): AuthMiddleware {
  return new AuthMiddleware(jwtSecret);
}

// Generate JWT token
export function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>, expiresIn: string = '24h'): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  return jwt.sign(payload, jwtSecret, { expiresIn });
}

// Generate refresh token
export function generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>, expiresIn: string = '7d'): string {
  const jwtSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  return jwt.sign(payload, jwtSecret, { expiresIn });
}

// Verify refresh token
export function verifyRefreshToken(token: string): JwtPayload {
  const jwtSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  return jwt.verify(token, jwtSecret) as JwtPayload;
} 