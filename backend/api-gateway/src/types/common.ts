// Common types for admin service
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  database?: {
    connected: boolean;
    responseTime?: number;
  };
} 