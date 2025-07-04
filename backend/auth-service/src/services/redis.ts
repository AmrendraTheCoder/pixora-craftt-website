import { createClient, RedisClientType } from 'redis';
import { createLogger } from '@pixora-craftt/shared/utils/logger.js';

const logger = createLogger('redis-service');

export class RedisService {
  private client: RedisClientType;
  private connected: boolean = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 10000,
        lazyConnect: true,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis reconnection attempts exceeded');
            return false;
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      logger.info('Redis client connected');
      this.connected = true;
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
    });

    this.client.on('error', (error) => {
      logger.error('Redis client error', error);
      this.connected = false;
    });

    this.client.on('end', () => {
      logger.info('Redis client disconnected');
      this.connected = false;
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis client reconnecting');
    });
  }

  async connect(): Promise<void> {
    try {
      if (!this.connected && !this.client.isOpen) {
        await this.client.connect();
        this.connected = true;
        logger.info('Redis connection established');
      }
    } catch (error) {
      logger.error('Failed to connect to Redis', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.connected && this.client.isOpen) {
        await this.client.quit();
        this.connected = false;
        logger.info('Redis connection closed');
      }
    } catch (error) {
      logger.error('Error disconnecting from Redis', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connected && this.client.isOpen;
  }

  async ping(): Promise<string> {
    try {
      return await this.client.ping();
    } catch (error) {
      logger.error('Redis ping failed', error);
      throw error;
    }
  }

  // Session management
  async setSession(userId: string, sessionId: string, data: any, ttlSeconds: number = 86400): Promise<void> {
    try {
      const key = `session:${userId}:${sessionId}`;
      await this.client.setEx(key, ttlSeconds, JSON.stringify(data));
      logger.debug('Session stored', { userId, sessionId, ttl: ttlSeconds });
    } catch (error) {
      logger.error('Failed to store session', { error, userId, sessionId });
      throw error;
    }
  }

  async getSession(userId: string, sessionId: string): Promise<any | null> {
    try {
      const key = `session:${userId}:${sessionId}`;
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Failed to get session', { error, userId, sessionId });
      return null;
    }
  }

  async deleteSession(userId: string, sessionId: string): Promise<void> {
    try {
      const key = `session:${userId}:${sessionId}`;
      await this.client.del(key);
      logger.debug('Session deleted', { userId, sessionId });
    } catch (error) {
      logger.error('Failed to delete session', { error, userId, sessionId });
      throw error;
    }
  }

  async deleteAllUserSessions(userId: string): Promise<void> {
    try {
      const pattern = `session:${userId}:*`;
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        logger.debug('All user sessions deleted', { userId, count: keys.length });
      }
    } catch (error) {
      logger.error('Failed to delete all user sessions', { error, userId });
      throw error;
    }
  }

  // Token blacklisting
  async blacklistToken(jti: string, expiresAt: Date): Promise<void> {
    try {
      const key = `blacklist:${jti}`;
      const ttl = Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      await this.client.setEx(key, ttl, '1');
      logger.debug('Token blacklisted', { jti, ttl });
    } catch (error) {
      logger.error('Failed to blacklist token', { error, jti });
      throw error;
    }
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    try {
      const key = `blacklist:${jti}`;
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Failed to check token blacklist', { error, jti });
      return false;
    }
  }

  // Rate limiting
  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    try {
      const current = await this.client.incr(key);
      
      if (current === 1) {
        await this.client.expire(key, windowSeconds);
      }

      const ttl = await this.client.ttl(key);
      const resetTime = new Date(Date.now() + (ttl * 1000));
      const remaining = Math.max(0, limit - current);
      const allowed = current <= limit;

      logger.debug('Rate limit check', { key, current, limit, remaining, allowed });

      return { allowed, remaining, resetTime };
    } catch (error) {
      logger.error('Rate limit check failed', { error, key });
      // Fail open - allow the request if Redis is down
      return { 
        allowed: true, 
        remaining: limit, 
        resetTime: new Date(Date.now() + (windowSeconds * 1000)) 
      };
    }
  }

  // Cache management
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
      logger.debug('Cache set', { key, ttl: ttlSeconds });
    } catch (error) {
      logger.error('Failed to set cache', { error, key });
      throw error;
    }
  }

  async get(key: string): Promise<any | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Failed to get cache', { error, key });
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
      logger.debug('Cache deleted', { key });
    } catch (error) {
      logger.error('Failed to delete cache', { error, key });
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Failed to check cache existence', { error, key });
      return false;
    }
  }

  // Email verification tokens
  async setEmailVerificationToken(email: string, token: string, ttlMinutes: number = 30): Promise<void> {
    try {
      const key = `email_verification:${email}`;
      await this.client.setEx(key, ttlMinutes * 60, token);
      logger.debug('Email verification token stored', { email, ttl: ttlMinutes });
    } catch (error) {
      logger.error('Failed to store email verification token', { error, email });
      throw error;
    }
  }

  async getEmailVerificationToken(email: string): Promise<string | null> {
    try {
      const key = `email_verification:${email}`;
      return await this.client.get(key);
    } catch (error) {
      logger.error('Failed to get email verification token', { error, email });
      return null;
    }
  }

  async deleteEmailVerificationToken(email: string): Promise<void> {
    try {
      const key = `email_verification:${email}`;
      await this.client.del(key);
      logger.debug('Email verification token deleted', { email });
    } catch (error) {
      logger.error('Failed to delete email verification token', { error, email });
      throw error;
    }
  }

  // Password reset tokens
  async setPasswordResetToken(email: string, token: string, ttlMinutes: number = 15): Promise<void> {
    try {
      const key = `password_reset:${email}`;
      await this.client.setEx(key, ttlMinutes * 60, token);
      logger.debug('Password reset token stored', { email, ttl: ttlMinutes });
    } catch (error) {
      logger.error('Failed to store password reset token', { error, email });
      throw error;
    }
  }

  async getPasswordResetToken(email: string): Promise<string | null> {
    try {
      const key = `password_reset:${email}`;
      return await this.client.get(key);
    } catch (error) {
      logger.error('Failed to get password reset token', { error, email });
      return null;
    }
  }

  async deletePasswordResetToken(email: string): Promise<void> {
    try {
      const key = `password_reset:${email}`;
      await this.client.del(key);
      logger.debug('Password reset token deleted', { email });
    } catch (error) {
      logger.error('Failed to delete password reset token', { error, email });
      throw error;
    }
  }

  // Failed login attempts
  async incrementFailedLogins(email: string): Promise<number> {
    try {
      const key = `failed_logins:${email}`;
      const count = await this.client.incr(key);
      
      if (count === 1) {
        await this.client.expire(key, 3600); // 1 hour TTL
      }
      
      return count;
    } catch (error) {
      logger.error('Failed to increment failed logins', { error, email });
      return 0;
    }
  }

  async getFailedLogins(email: string): Promise<number> {
    try {
      const key = `failed_logins:${email}`;
      const count = await this.client.get(key);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      logger.error('Failed to get failed logins', { error, email });
      return 0;
    }
  }

  async resetFailedLogins(email: string): Promise<void> {
    try {
      const key = `failed_logins:${email}`;
      await this.client.del(key);
      logger.debug('Failed logins reset', { email });
    } catch (error) {
      logger.error('Failed to reset failed logins', { error, email });
      throw error;
    }
  }
} 