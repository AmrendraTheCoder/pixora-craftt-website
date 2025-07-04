import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { ApiResponse, UserRole } from '@pixora-craftt/shared/types/common.js';
import { createLogger } from '@pixora-craftt/shared/utils/logger.js';
import { User } from '../entities/User.js';
import { UserSession } from '../entities/UserSession.js';
import { JWTService } from '../services/jwt.js';
import { RedisService } from '../services/redis.js';
import { EmailService } from '../services/email.js';

const logger = createLogger('auth-controller');
const jwtService = new JWTService();

class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, phone, company, title } = req.body;
      const database = req.database;
      const emailService = req.emailService as EmailService;
      
      const userRepo = database.getRepository(User);
      
      // Check if user already exists
      const existingUser = await userRepo.findOne({ where: { email } });
      if (existingUser) {
        const response: ApiResponse = {
          success: false,
          error: 'User with this email already exists'
        };
        res.status(400).json(response);
        return;
      }

      // Create new user
      const user = userRepo.create({
        email,
        password,
        firstName,
        lastName,
        phone,
        company,
        title,
        role: UserRole.USER
      });

      // Generate email verification token
      const verificationToken = jwtService.generateEmailVerificationToken(email);
      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      await userRepo.save(user);

      // Send welcome email with verification
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      await emailService.sendWelcomeEmail(email, firstName, verificationUrl);

      logger.info('User registered successfully', { 
        userId: user.id, 
        email, 
        ip: req.ip 
      });

      const response: ApiResponse = {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: {
          userId: user.id,
          email: user.email,
          emailVerificationRequired: true
        }
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Registration failed', { error, body: req.body, ip: req.ip });
      
      const response: ApiResponse = {
        success: false,
        error: 'Registration failed. Please try again.'
      };
      
      res.status(500).json(response);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, twoFactorCode, rememberMe = false } = req.body;
      const database = req.database;
      const redisService = req.redisService as RedisService;
      const emailService = req.emailService as EmailService;
      
      const userRepo = database.getRepository(User);
      const sessionRepo = database.getRepository(UserSession);

      // Find user
      const user = await userRepo.findOne({ where: { email } });
      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid email or password'
        };
        res.status(401).json(response);
        return;
      }

      // Check if account is locked
      if (user.isLocked) {
        const response: ApiResponse = {
          success: false,
          error: 'Account is temporarily locked due to too many failed login attempts'
        };
        res.status(423).json(response);
        return;
      }

      // Check if account is active
      if (!user.isActive) {
        const response: ApiResponse = {
          success: false,
          error: 'Account is deactivated. Please contact support.'
        };
        res.status(403).json(response);
        return;
      }

      // Validate password
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        user.incrementFailedAttempts();
        await userRepo.save(user);
        
        const response: ApiResponse = {
          success: false,
          error: 'Invalid email or password'
        };
        res.status(401).json(response);
        return;
      }

      // Check two-factor authentication
      if (user.twoFactorEnabled) {
        if (!twoFactorCode) {
          const response: ApiResponse = {
            success: false,
            error: 'Two-factor authentication code required',
            data: { twoFactorRequired: true }
          };
          res.status(200).json(response);
          return;
        }

        const isValidTwoFactor = jwtService.verifyTwoFactorCode(user.twoFactorSecret!, twoFactorCode);
        if (!isValidTwoFactor) {
          const response: ApiResponse = {
            success: false,
            error: 'Invalid two-factor authentication code'
          };
          res.status(401).json(response);
          return;
        }
      }

      // Generate tokens
      const tokenPair = jwtService.generateTokenPair(
        user.id,
        user.email,
        user.role,
        undefined,
        rememberMe
      );

      // Parse user agent for session tracking
      const userAgent = req.get('User-Agent') || '';
      const deviceInfo = UserSession.parseUserAgent(userAgent);
      
      // Create session record
      const session = sessionRepo.create({
        userId: user.id,
        refreshToken: tokenPair.refreshToken,
        accessTokenJti: tokenPair.jti,
        expiresAt: tokenPair.refreshTokenExpires,
        ipAddress: req.ip,
        userAgent,
        ...deviceInfo
      });

      await sessionRepo.save(session);

      // Update user login info
      user.updateLastLogin(req.ip);
      await userRepo.save(user);

      // Send login alert email (optional)
      if (process.env.SEND_LOGIN_ALERTS === 'true') {
        const loginDetails = {
          ip: req.ip || 'Unknown',
          device: `${deviceInfo.browser} on ${deviceInfo.os}`,
          time: new Date()
        };
        await emailService.sendLoginAlert(user.email, user.firstName, loginDetails);
      }

      logger.info('User logged in successfully', {
        userId: user.id,
        email: user.email,
        ip: req.ip,
        sessionId: session.id
      });

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: user.toSafeObject(),
          accessToken: tokenPair.accessToken,
          refreshToken: tokenPair.refreshToken,
          expiresAt: tokenPair.accessTokenExpires,
          sessionId: session.id
        }
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Login failed', { error, body: req.body, ip: req.ip });
      
      const response: ApiResponse = {
        success: false,
        error: 'Login failed. Please try again.'
      };
      
      res.status(500).json(response);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.body.refreshToken || req.get('Authorization')?.replace('Bearer ', '');
      
      if (!refreshToken) {
        const response: ApiResponse = {
          success: true,
          message: 'Logout successful'
        };
        res.status(200).json(response);
        return;
      }

      const database = req.database;
      const redisService = req.redisService as RedisService;
      const sessionRepo = database.getRepository(UserSession);

      try {
        // Verify and extract token payload
        const payload = jwtService.verifyRefreshToken(refreshToken);
        
        // Find and invalidate session
        const session = await sessionRepo.findOne({
          where: { refreshToken, userId: payload.userId }
        });

        if (session) {
          session.invalidate();
          await sessionRepo.save(session);

          // Blacklist the access token
          await redisService.blacklistToken(payload.jti, new Date(payload.exp * 1000));
        }

        logger.info('User logged out successfully', {
          userId: payload.userId,
          sessionId: payload.sessionId,
          ip: req.ip
        });
      } catch (tokenError) {
        // Token might be invalid or expired, but we still count this as successful logout
        logger.warn('Logout with invalid token', { error: tokenError.message });
      }

      const response: ApiResponse = {
        success: true,
        message: 'Logout successful'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Logout failed', { error, ip: req.ip });
      
      const response: ApiResponse = {
        success: false,
        error: 'Logout failed'
      };
      
      res.status(500).json(response);
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const database = req.database;
      const redisService = req.redisService as RedisService;
      
      const userRepo = database.getRepository(User);
      const sessionRepo = database.getRepository(UserSession);

      // Verify refresh token
      const payload = jwtService.verifyRefreshToken(refreshToken);
      
      // Check if token is blacklisted
      const isBlacklisted = await redisService.isTokenBlacklisted(payload.jti);
      if (isBlacklisted) {
        const response: ApiResponse = {
          success: false,
          error: 'Token has been invalidated'
        };
        res.status(401).json(response);
        return;
      }

      // Find session
      const session = await sessionRepo.findOne({
        where: { refreshToken, userId: payload.userId, isActive: true }
      });

      if (!session || !session.isValid) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid or expired refresh token'
        };
        res.status(401).json(response);
        return;
      }

      // Find user
      const user = await userRepo.findOne({ where: { id: payload.userId } });
      if (!user || !user.isActive) {
        const response: ApiResponse = {
          success: false,
          error: 'User account not found or inactive'
        };
        res.status(401).json(response);
        return;
      }

      // Generate new token pair
      const newTokenPair = jwtService.generateTokenPair(
        user.id,
        user.email,
        user.role,
        session.id
      );

      // Update session
      session.refreshToken = newTokenPair.refreshToken;
      session.accessTokenJti = newTokenPair.jti;
      session.expiresAt = newTokenPair.refreshTokenExpires;
      session.updateLastUsed();
      
      await sessionRepo.save(session);

      // Blacklist old access token
      await redisService.blacklistToken(payload.jti, new Date(payload.exp * 1000));

      logger.info('Token refreshed successfully', {
        userId: user.id,
        sessionId: session.id,
        ip: req.ip
      });

      const response: ApiResponse = {
        success: true,
        data: {
          accessToken: newTokenPair.accessToken,
          refreshToken: newTokenPair.refreshToken,
          expiresAt: newTokenPair.accessTokenExpires
        }
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Token refresh failed', { error, ip: req.ip });
      
      const response: ApiResponse = {
        success: false,
        error: 'Token refresh failed'
      };
      
      res.status(401).json(response);
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const database = req.database;
      const emailService = req.emailService as EmailService;
      
      const userRepo = database.getRepository(User);
      
      // Find user (always return success to prevent email enumeration)
      const user = await userRepo.findOne({ where: { email } });
      
      if (user && user.isActive) {
        // Generate reset token
        const resetToken = jwtService.generatePasswordResetToken(email);
        
        // Update user with reset token
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        
        await userRepo.save(user);

        // Send reset email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await emailService.sendPasswordReset(email, user.firstName, resetUrl);

        logger.info('Password reset requested', { email, userId: user.id, ip: req.ip });
      } else {
        logger.warn('Password reset requested for non-existent or inactive user', { email, ip: req.ip });
      }

      // Always return success
      const response: ApiResponse = {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Forgot password failed', { error, body: req.body, ip: req.ip });
      
      const response: ApiResponse = {
        success: false,
        error: 'Failed to process password reset request'
      };
      
      res.status(500).json(response);
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;
      const database = req.database;
      const emailService = req.emailService as EmailService;
      
      const userRepo = database.getRepository(User);

      // Verify reset token
      const payload = jwtService.verifyPasswordResetToken(token);
      
      // Find user
      const user = await userRepo.findOne({
        where: {
          email: payload.email,
          passwordResetToken: token,
          passwordResetExpires: { $gt: new Date() } as any
        }
      });

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid or expired password reset token'
        };
        res.status(400).json(response);
        return;
      }

      // Update password
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.resetFailedAttempts();
      
      await userRepo.save(user);

      // Invalidate all user sessions
      const sessionRepo = database.getRepository(UserSession);
      await sessionRepo.update(
        { userId: user.id },
        { isActive: false }
      );

      // Send confirmation email
      await emailService.sendPasswordChanged(user.email, user.firstName);

      logger.info('Password reset successful', {
        userId: user.id,
        email: user.email,
        ip: req.ip
      });

      const response: ApiResponse = {
        success: true,
        message: 'Password has been reset successfully. Please login with your new password.'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Password reset failed', { error, body: req.body, ip: req.ip });
      
      const response: ApiResponse = {
        success: false,
        error: 'Password reset failed. The token may be invalid or expired.'
      };
      
      res.status(400).json(response);
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      const database = req.database;
      
      const userRepo = database.getRepository(User);

      // Verify email token
      const payload = jwtService.verifyEmailVerificationToken(token);
      
      // Find user
      const user = await userRepo.findOne({
        where: {
          email: payload.email,
          emailVerificationToken: token,
          emailVerificationExpires: { $gt: new Date() } as any
        }
      });

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid or expired verification token'
        };
        res.status(400).json(response);
        return;
      }

      // Update user
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      
      await userRepo.save(user);

      logger.info('Email verified successfully', {
        userId: user.id,
        email: user.email,
        ip: req.ip
      });

      const response: ApiResponse = {
        success: true,
        message: 'Email verified successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Email verification failed', { error, body: req.body, ip: req.ip });
      
      const response: ApiResponse = {
        success: false,
        error: 'Email verification failed. The token may be invalid or expired.'
      };
      
      res.status(400).json(response);
    }
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      
      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: user.toSafeObject()
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get current user failed', { error, userId: req.user?.id });
      
      const response: ApiResponse = {
        success: false,
        error: 'Failed to retrieve user information'
      };
      
      res.status(500).json(response);
    }
  }

  // Additional methods would continue here...
  // Including: resendVerification, changePassword, setupTwoFactor, verifyTwoFactor, 
  // disableTwoFactor, logoutAllDevices, getUserSessions, revokeSession,
  // getAllUsers, updateUserRole, updateUserStatus
}

export const authController = new AuthController(); 