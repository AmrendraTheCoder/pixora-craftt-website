import winston from 'winston';
import { LogEntry } from '../types/common.js';

export interface LoggerConfig {
  service: string;
  level?: string;
  format?: winston.Logform.Format;
  transports?: winston.transport[];
}

class Logger {
  private logger: winston.Logger;
  private serviceName: string;

  constructor(config: LoggerConfig) {
    this.serviceName = config.service;
    
    const defaultFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
        return JSON.stringify({
          timestamp,
          level,
          message,
          service: service || this.serviceName,
          ...meta
        });
      })
    );

    const defaultTransports = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
          winston.format.printf(({ timestamp, level, message, service }) => {
            return `${timestamp} [${service || this.serviceName}] ${level}: ${message}`;
          })
        )
      }),
      new winston.transports.File({
        filename: `logs/${this.serviceName}-error.log`,
        level: 'error',
        format: defaultFormat
      }),
      new winston.transports.File({
        filename: `logs/${this.serviceName}-combined.log`,
        format: defaultFormat
      })
    ];

    this.logger = winston.createLogger({
      level: config.level || process.env.LOG_LEVEL || 'info',
      format: config.format || defaultFormat,
      transports: config.transports || defaultTransports,
      defaultMeta: { service: this.serviceName }
    });
  }

  info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, meta);
  }

  error(message: string, error?: Error | Record<string, any>): void {
    if (error instanceof Error) {
      this.logger.error(message, {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      });
    } else {
      this.logger.error(message, error);
    }
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(message, meta);
  }

  // Structured logging methods
  logRequest(method: string, url: string, statusCode: number, responseTime: number, userId?: string): void {
    this.info('HTTP Request', {
      type: 'http_request',
      method,
      url,
      statusCode,
      responseTime,
      userId
    });
  }

  logDatabaseQuery(query: string, duration: number, error?: Error): void {
    if (error) {
      this.error('Database Query Failed', {
        type: 'database_query',
        query: query.substring(0, 200), // Truncate for privacy
        duration,
        error
      });
    } else {
      this.debug('Database Query', {
        type: 'database_query',
        query: query.substring(0, 200),
        duration
      });
    }
  }

  logAuthEvent(event: string, userId: string, success: boolean, details?: Record<string, any>): void {
    this.info('Authentication Event', {
      type: 'auth_event',
      event,
      userId,
      success,
      ...details
    });
  }

  logBusinessEvent(event: string, userId: string, details?: Record<string, any>): void {
    this.info('Business Event', {
      type: 'business_event',
      event,
      userId,
      ...details
    });
  }

  // Performance monitoring
  createTimer(label: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.debug(`Timer: ${label}`, { duration });
      return duration;
    };
  }

  // Health check logging
  logHealthCheck(status: 'healthy' | 'unhealthy' | 'degraded', details?: Record<string, any>): void {
    this.info('Health Check', {
      type: 'health_check',
      status,
      ...details
    });
  }
}

// Factory function to create service-specific loggers
export function createLogger(serviceName: string, config?: Partial<LoggerConfig>): Logger {
  return new Logger({
    service: serviceName,
    ...config
  });
}

// Default logger instance
export const logger = createLogger('pixora-craftt');

export default Logger; 