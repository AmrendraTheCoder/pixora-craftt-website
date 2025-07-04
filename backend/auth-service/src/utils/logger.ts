// Simple logger utility for admin service
export interface Logger {
  info(message: string, meta?: any): void;
  error(message: string, error?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
  logRequest(method: string, url: string, statusCode: number, responseTime: number): void;
}

class SimpleLogger implements Logger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  private log(level: string, message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      service: this.serviceName,
      message,
      ...meta
    };
    console.log(JSON.stringify(logEntry));
  }

  info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }

  error(message: string, error?: any): void {
    this.log('error', message, { error: error?.message || error });
  }

  warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }

  debug(message: string, meta?: any): void {
    this.log('debug', message, meta);
  }

  logRequest(method: string, url: string, statusCode: number, responseTime: number): void {
    this.info('HTTP Request', {
      method,
      url,
      statusCode,
      responseTime
    });
  }
}

export function createLogger(serviceName: string): Logger {
  return new SimpleLogger(serviceName);
} 