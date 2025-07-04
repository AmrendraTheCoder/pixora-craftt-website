export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: ValidationError[];
  pagination?: PaginationMeta;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user'
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon?: string;
  color: string;
  image?: string;
  caseStudyLink?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  description: string;
  fullDescription?: string;
  image: string;
  tags: string[];
  clientName?: string;
  projectUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export enum ProjectCategory {
  WEB = 'web',
  UIUX = 'uiux',
  SOCIAL = 'social',
  MOBILE = 'mobile',
  BRANDING = 'branding'
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar?: string;
  rating: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  status: ContactStatus;
  source?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  notes?: ContactNote[];
}

export enum ContactStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  IN_PROGRESS = 'in_progress',
  QUALIFIED = 'qualified',
  CONVERTED = 'converted',
  CLOSED = 'closed'
}

export interface ContactNote {
  id: string;
  contactId: string;
  content: string;
  createdBy: string;
  createdAt: Date;
}

export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  bucket?: string;
  key?: string;
  uploadedBy: string;
  createdAt: Date;
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
  redis?: {
    connected: boolean;
    responseTime?: number;
  };
  dependencies?: HealthCheck[];
}

export interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: Date;
  service: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailJob {
  id: string;
  to: string;
  subject: string;
  template?: string;
  htmlContent?: string;
  textContent?: string;
  variables?: Record<string, any>;
  status: EmailStatus;
  attempts: number;
  maxAttempts: number;
  scheduledAt?: Date;
  sentAt?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum EmailStatus {
  PENDING = 'pending',
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
  SCHEDULED = 'scheduled'
} 