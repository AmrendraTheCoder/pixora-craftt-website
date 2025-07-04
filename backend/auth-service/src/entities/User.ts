import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
  OneToMany
} from 'typeorm';
import bcrypt from 'bcryptjs';
import { UserRole } from '@pixora-craftt/shared/types/common.js';
import { UserSession } from './UserSession.js';

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role!: UserRole;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'is_email_verified', type: 'boolean', default: false })
  isEmailVerified!: boolean;

  @Column({ name: 'email_verification_token', type: 'varchar', length: 255, nullable: true })
  emailVerificationToken?: string;

  @Column({ name: 'email_verification_expires', type: 'timestamp', nullable: true })
  emailVerificationExpires?: Date;

  @Column({ name: 'password_reset_token', type: 'varchar', length: 255, nullable: true })
  passwordResetToken?: string;

  @Column({ name: 'password_reset_expires', type: 'timestamp', nullable: true })
  passwordResetExpires?: Date;

  @Column({ name: 'two_factor_secret', type: 'varchar', length: 255, nullable: true })
  twoFactorSecret?: string;

  @Column({ name: 'two_factor_enabled', type: 'boolean', default: false })
  twoFactorEnabled!: boolean;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ name: 'last_login_ip', type: 'varchar', length: 45, nullable: true })
  lastLoginIp?: string;

  @Column({ name: 'failed_login_attempts', type: 'integer', default: 0 })
  failedLoginAttempts!: number;

  @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
  lockedUntil?: Date;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  company?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  title?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @OneToMany(() => UserSession, session => session.user)
  sessions!: UserSession[];

  // Methods
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2')) {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get isLocked(): boolean {
    return this.lockedUntil ? this.lockedUntil > new Date() : false;
  }

  incrementFailedAttempts(): void {
    this.failedLoginAttempts += 1;
    
    // Lock account after 5 failed attempts for 30 minutes
    if (this.failedLoginAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }
  }

  resetFailedAttempts(): void {
    this.failedLoginAttempts = 0;
    this.lockedUntil = undefined;
  }

  updateLastLogin(ipAddress?: string): void {
    this.lastLoginAt = new Date();
    this.lastLoginIp = ipAddress;
    this.resetFailedAttempts();
  }

  // Convert to safe object (remove sensitive data)
  toSafeObject() {
    const { password, passwordResetToken, emailVerificationToken, twoFactorSecret, ...safeUser } = this;
    return safeUser;
  }

  // Check if user has permission
  hasPermission(requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(this.role);
  }

  // Check if user is admin or above
  isAdmin(): boolean {
    return [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(this.role);
  }

  // Check if user is super admin
  isSuperAdmin(): boolean {
    return this.role === UserRole.SUPER_ADMIN;
  }
} 