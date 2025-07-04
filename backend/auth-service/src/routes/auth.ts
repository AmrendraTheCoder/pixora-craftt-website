import { Router } from 'express';
import { authController } from '../controllers/auth.js';
import { validate } from '../middleware/validation.js';
import { authenticate } from '@pixora-craftt/shared/middleware/auth.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  setupTwoFactorSchema,
  verifyTwoFactorSchema
} from '../validation/auth.js';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);

// Password reset routes
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Email verification routes
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// Two-factor authentication routes
router.post('/2fa/setup', authenticate, validate(setupTwoFactorSchema), authController.setupTwoFactor);
router.post('/2fa/verify', authenticate, validate(verifyTwoFactorSchema), authController.verifyTwoFactor);
router.post('/2fa/disable', authenticate, authController.disableTwoFactor);

// Protected routes
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/logout-all', authenticate, authController.logoutAllDevices);
router.get('/sessions', authenticate, authController.getUserSessions);
router.delete('/sessions/:sessionId', authenticate, authController.revokeSession);

// Admin routes
router.get('/users', authenticate, authController.getAllUsers);
router.patch('/users/:userId/role', authenticate, authController.updateUserRole);
router.patch('/users/:userId/status', authenticate, authController.updateUserStatus);

export { router as authRoutes }; 