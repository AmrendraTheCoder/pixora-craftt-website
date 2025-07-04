import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { createLogger } from '@pixora-craftt/shared/utils/logger.js';
import { UserRole } from '@pixora-craftt/shared/types/common.js';

const logger = createLogger('jwt-service');

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionId: string;
  jti: string;
  iat: number;
  exp: number;
}

export interface AccessTokenPayload extends TokenPayload {
  type: 'access';
}

export interface RefreshTokenPayload extends TokenPayload {
  type: 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: Date;
  refreshTokenExpires: Date;
  sessionId: string;
  jti: string;
}

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export class JWTService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';

    if (process.env.NODE_ENV === 'production') {
      this.validateSecrets();
    }
  }

  private validateSecrets(): void {
    const minLength = 32;
    
    if (this.accessTokenSecret.length < minLength) {
      throw new Error(`JWT_ACCESS_SECRET must be at least ${minLength} characters long`);
    }
    
    if (this.refreshTokenSecret.length < minLength) {
      throw new Error(`JWT_REFRESH_SECRET must be at least ${minLength} characters long`);
    }
    
    if (this.accessTokenSecret === this.refreshTokenSecret) {
      throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
    }
  }

  generateTokenPair(
    userId: string,
    email: string,
    role: UserRole,
    sessionId?: string,
    rememberMe: boolean = false
  ): TokenPair {
    try {
      const jti = this.generateJTI();
      const currentSessionId = sessionId || this.generateSessionId();
      
      // Adjust expiry for "remember me" functionality
      const refreshExpiry = rememberMe ? '30d' : this.refreshTokenExpiry;

      const basePayload = {
        userId,
        email,
        role,
        sessionId: currentSessionId,
        jti
      };

      // Generate access token
      const accessTokenPayload: AccessTokenPayload = {
        ...basePayload,
        type: 'access'
      };

      const accessToken = jwt.sign(accessTokenPayload, this.accessTokenSecret, {
        expiresIn: this.accessTokenExpiry,
        algorithm: 'HS256',
        issuer: process.env.JWT_ISSUER || 'pixora-craftt',
        audience: process.env.JWT_AUDIENCE || 'pixora-craftt-app'
      });

      // Generate refresh token
      const refreshTokenPayload: RefreshTokenPayload = {
        ...basePayload,
        type: 'refresh'
      };

      const refreshToken = jwt.sign(refreshTokenPayload, this.refreshTokenSecret, {
        expiresIn: refreshExpiry,
        algorithm: 'HS256',
        issuer: process.env.JWT_ISSUER || 'pixora-craftt',
        audience: process.env.JWT_AUDIENCE || 'pixora-craftt-app'
      });

      // Calculate expiration dates
      const accessTokenExpires = this.calculateExpiry(this.accessTokenExpiry);
      const refreshTokenExpires = this.calculateExpiry(refreshExpiry);

      logger.debug('Token pair generated', {
        userId,
        email,
        role,
        sessionId: currentSessionId,
        jti,
        accessExpires: accessTokenExpires,
        refreshExpires: refreshTokenExpires
      });

      return {
        accessToken,
        refreshToken,
        accessTokenExpires,
        refreshTokenExpires,
        sessionId: currentSessionId,
        jti
      };
    } catch (error) {
      logger.error('Failed to generate token pair', { error, userId, email });
      throw new Error('Token generation failed');
    }
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      const payload = jwt.verify(token, this.accessTokenSecret, {
        algorithms: ['HS256'],
        issuer: process.env.JWT_ISSUER || 'pixora-craftt',
        audience: process.env.JWT_AUDIENCE || 'pixora-craftt-app'
      }) as AccessTokenPayload;

      if (payload.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error) {
      logger.warn('Access token verification failed', { error: error.message });
      throw error;
    }
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const payload = jwt.verify(token, this.refreshTokenSecret, {
        algorithms: ['HS256'],
        issuer: process.env.JWT_ISSUER || 'pixora-craftt',
        audience: process.env.JWT_AUDIENCE || 'pixora-craftt-app'
      }) as RefreshTokenPayload;

      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error) {
      logger.warn('Refresh token verification failed', { error: error.message });
      throw error;
    }
  }

  extractPayloadWithoutVerification(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.warn('Token payload extraction failed', { error: error.message });
      return null;
    }
  }

  generateJTI(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  generateSessionId(): string {
    return crypto.randomUUID();
  }

  private calculateExpiry(expiry: string): Date {
    const now = new Date();
    
    // Parse expiry string (e.g., "15m", "7d", "1h")
    const match = expiry.match(/^(\d+)([mhd])$/);
    if (!match) {
      throw new Error(`Invalid expiry format: ${expiry}`);
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'm': // minutes
        return new Date(now.getTime() + value * 60 * 1000);
      case 'h': // hours
        return new Date(now.getTime() + value * 60 * 60 * 1000);
      case 'd': // days
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      default:
        throw new Error(`Unsupported time unit: ${unit}`);
    }
  }

  // Two-Factor Authentication methods
  generateTwoFactorSecret(email: string): TwoFactorSetup {
    try {
      const secret = speakeasy.generateSecret({
        name: `Pixora Craftt (${email})`,
        issuer: 'Pixora Craftt',
        length: 32
      });

      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () => 
        crypto.randomBytes(4).toString('hex').toUpperCase()
      );

      return {
        secret: secret.base32,
        qrCodeUrl: secret.otpauth_url!,
        backupCodes
      };
    } catch (error) {
      logger.error('Failed to generate two-factor secret', { error, email });
      throw new Error('Two-factor setup failed');
    }
  }

  async generateQRCode(otpauthUrl: string): Promise<string> {
    try {
      return await qrcode.toDataURL(otpauthUrl);
    } catch (error) {
      logger.error('Failed to generate QR code', { error });
      throw new Error('QR code generation failed');
    }
  }

  verifyTwoFactorCode(secret: string, code: string): boolean {
    try {
      return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: code,
        window: 2, // Allow 2 steps before/after current time
        time: Math.floor(Date.now() / 1000)
      });
    } catch (error) {
      logger.error('Two-factor code verification failed', { error });
      return false;
    }
  }

  // Email verification token
  generateEmailVerificationToken(email: string): string {
    try {
      const payload = {
        email,
        type: 'email_verification',
        iat: Math.floor(Date.now() / 1000)
      };

      return jwt.sign(payload, this.accessTokenSecret, {
        expiresIn: '30m',
        algorithm: 'HS256'
      });
    } catch (error) {
      logger.error('Failed to generate email verification token', { error, email });
      throw new Error('Email verification token generation failed');
    }
  }

  verifyEmailVerificationToken(token: string): { email: string } {
    try {
      const payload = jwt.verify(token, this.accessTokenSecret, {
        algorithms: ['HS256']
      }) as any;

      if (payload.type !== 'email_verification') {
        throw new Error('Invalid token type');
      }

      return { email: payload.email };
    } catch (error) {
      logger.warn('Email verification token verification failed', { error: error.message });
      throw error;
    }
  }

  // Password reset token
  generatePasswordResetToken(email: string): string {
    try {
      const payload = {
        email,
        type: 'password_reset',
        iat: Math.floor(Date.now() / 1000),
        // Add a random component to prevent token reuse
        nonce: crypto.randomBytes(16).toString('hex')
      };

      return jwt.sign(payload, this.refreshTokenSecret, {
        expiresIn: '15m',
        algorithm: 'HS256'
      });
    } catch (error) {
      logger.error('Failed to generate password reset token', { error, email });
      throw new Error('Password reset token generation failed');
    }
  }

  verifyPasswordResetToken(token: string): { email: string; nonce: string } {
    try {
      const payload = jwt.verify(token, this.refreshTokenSecret, {
        algorithms: ['HS256']
      }) as any;

      if (payload.type !== 'password_reset') {
        throw new Error('Invalid token type');
      }

      return { email: payload.email, nonce: payload.nonce };
    } catch (error) {
      logger.warn('Password reset token verification failed', { error: error.message });
      throw error;
    }
  }

  // Utility methods
  getTokenExpiry(token: string): Date | null {
    try {
      const payload = jwt.decode(token) as any;
      return payload?.exp ? new Date(payload.exp * 1000) : null;
    } catch (error) {
      logger.warn('Failed to extract token expiry', { error: error.message });
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const expiry = this.getTokenExpiry(token);
    return expiry ? expiry < new Date() : true;
  }

  getTimeUntilExpiry(token: string): number {
    const expiry = this.getTokenExpiry(token);
    return expiry ? Math.max(0, expiry.getTime() - Date.now()) : 0;
  }

  // Generate secure random tokens
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  generateNumericCode(length: number = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  // Hash tokens for storage
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  compareTokenHash(token: string, hash: string): boolean {
    return this.hashToken(token) === hash;
  }
} 