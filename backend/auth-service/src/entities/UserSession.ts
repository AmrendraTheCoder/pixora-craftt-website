import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { User } from './User.js';

@Entity('user_sessions')
@Index(['refreshToken'], { unique: true })
@Index(['userId', 'isActive'])
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'refresh_token', type: 'varchar', length: 500, unique: true })
  refreshToken!: string;

  @Column({ name: 'access_token_jti', type: 'varchar', length: 255 })
  accessTokenJti!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'device_type', type: 'varchar', length: 50, nullable: true })
  deviceType?: string;

  @Column({ name: 'browser', type: 'varchar', length: 100, nullable: true })
  browser?: string;

  @Column({ name: 'os', type: 'varchar', length: 100, nullable: true })
  os?: string;

  @Column({ name: 'country', type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ name: 'city', type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => User, user => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // Methods
  get isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  get isValid(): boolean {
    return this.isActive && !this.isExpired;
  }

  updateLastUsed(): void {
    this.lastUsedAt = new Date();
  }

  invalidate(): void {
    this.isActive = false;
  }

  // Parse user agent to extract device info
  static parseUserAgent(userAgent?: string) {
    if (!userAgent) return {};

    const deviceType = this.getDeviceType(userAgent);
    const browser = this.getBrowser(userAgent);
    const os = this.getOS(userAgent);

    return { deviceType, browser, os };
  }

  private static getDeviceType(userAgent: string): string {
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      if (/iPad/.test(userAgent)) return 'Tablet';
      return 'Mobile';
    }
    return 'Desktop';
  }

  private static getBrowser(userAgent: string): string {
    if (/Chrome/.test(userAgent)) return 'Chrome';
    if (/Firefox/.test(userAgent)) return 'Firefox';
    if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) return 'Safari';
    if (/Edge/.test(userAgent)) return 'Edge';
    if (/Opera/.test(userAgent)) return 'Opera';
    return 'Unknown';
  }

  private static getOS(userAgent: string): string {
    if (/Windows/.test(userAgent)) return 'Windows';
    if (/Mac OS/.test(userAgent)) return 'macOS';
    if (/Linux/.test(userAgent)) return 'Linux';
    if (/Android/.test(userAgent)) return 'Android';
    if (/iPhone|iPad/.test(userAgent)) return 'iOS';
    return 'Unknown';
  }

  // Create session data for client
  toClientData() {
    return {
      id: this.id,
      deviceType: this.deviceType,
      browser: this.browser,
      os: this.os,
      ipAddress: this.ipAddress,
      country: this.country,
      city: this.city,
      lastUsedAt: this.lastUsedAt,
      createdAt: this.createdAt,
      isActive: this.isActive,
      isCurrent: false // This will be set by the service
    };
  }
} 