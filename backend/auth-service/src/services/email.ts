import nodemailer, { Transporter } from 'nodemailer';
import { createLogger } from '@pixora-craftt/shared/utils/logger.js';

const logger = createLogger('email-service');

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private transporter: Transporter;
  private isConfigured: boolean = false;

  constructor() {
    this.setupTransporter();
  }

  private setupTransporter(): void {
    try {
      if (process.env.EMAIL_PROVIDER === 'smtp') {
        this.transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
          },
          tls: {
            rejectUnauthorized: process.env.NODE_ENV === 'production'
          }
        });
      } else if (process.env.EMAIL_PROVIDER === 'sendgrid') {
        // SendGrid configuration would go here
        this.transporter = nodemailer.createTransporter({
          service: 'SendGrid',
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        });
      } else if (process.env.EMAIL_PROVIDER === 'gmail') {
        this.transporter = nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
          }
        });
      } else {
        // Development mode - use Ethereal for testing
        this.setupEtherealTransporter();
        return;
      }

      this.isConfigured = true;
      logger.info('Email service configured', { provider: process.env.EMAIL_PROVIDER });
    } catch (error) {
      logger.error('Failed to setup email transporter', error);
      this.setupEtherealTransporter();
    }
  }

  private async setupEtherealTransporter(): Promise<void> {
    try {
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      this.isConfigured = true;
      logger.info('Email service configured with Ethereal for development', {
        user: testAccount.user,
        pass: testAccount.pass
      });
    } catch (error) {
      logger.error('Failed to setup Ethereal transporter', error);
      this.isConfigured = false;
    }
  }

  async sendEmail(to: string, template: EmailTemplate, from?: string): Promise<boolean> {
    if (!this.isConfigured) {
      logger.warn('Email service not configured, skipping email send', { to, subject: template.subject });
      return false;
    }

    try {
      const mailOptions = {
        from: from || process.env.EMAIL_FROM || 'noreply@pixora-craftt.com',
        to,
        subject: template.subject,
        text: template.text,
        html: template.html
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info('Email sent successfully', {
        to,
        subject: template.subject,
        messageId: info.messageId,
        preview: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl(info) : undefined
      });

      return true;
    } catch (error) {
      logger.error('Failed to send email', {
        error,
        to,
        subject: template.subject
      });
      return false;
    }
  }

  async sendWelcomeEmail(to: string, firstName: string, verificationUrl: string): Promise<boolean> {
    const template: EmailTemplate = {
      subject: 'Welcome to Pixora Craftt - Verify Your Email',
      html: this.generateWelcomeEmailHtml(firstName, verificationUrl),
      text: this.generateWelcomeEmailText(firstName, verificationUrl)
    };

    return this.sendEmail(to, template);
  }

  async sendEmailVerification(to: string, firstName: string, verificationUrl: string): Promise<boolean> {
    const template: EmailTemplate = {
      subject: 'Verify Your Email Address - Pixora Craftt',
      html: this.generateVerificationEmailHtml(firstName, verificationUrl),
      text: this.generateVerificationEmailText(firstName, verificationUrl)
    };

    return this.sendEmail(to, template);
  }

  async sendPasswordReset(to: string, firstName: string, resetUrl: string): Promise<boolean> {
    const template: EmailTemplate = {
      subject: 'Reset Your Password - Pixora Craftt',
      html: this.generatePasswordResetEmailHtml(firstName, resetUrl),
      text: this.generatePasswordResetEmailText(firstName, resetUrl)
    };

    return this.sendEmail(to, template);
  }

  async sendPasswordChanged(to: string, firstName: string): Promise<boolean> {
    const template: EmailTemplate = {
      subject: 'Password Changed Successfully - Pixora Craftt',
      html: this.generatePasswordChangedEmailHtml(firstName),
      text: this.generatePasswordChangedEmailText(firstName)
    };

    return this.sendEmail(to, template);
  }

  async sendLoginAlert(to: string, firstName: string, loginDetails: { ip: string; device: string; location?: string; time: Date }): Promise<boolean> {
    const template: EmailTemplate = {
      subject: 'New Login to Your Account - Pixora Craftt',
      html: this.generateLoginAlertEmailHtml(firstName, loginDetails),
      text: this.generateLoginAlertEmailText(firstName, loginDetails)
    };

    return this.sendEmail(to, template);
  }

  // HTML Email Templates
  private generateWelcomeEmailHtml(firstName: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Pixora Craftt</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Pixora Craftt!</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName},</h2>
            <p>Welcome to Pixora Craftt! We're excited to have you on board.</p>
            <p>To get started, please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p>This verification link will expire in 30 minutes for security reasons.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
            <p>Best regards,<br>The Pixora Craftt Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Pixora Craftt. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateWelcomeEmailText(firstName: string, verificationUrl: string): string {
    return `
Welcome to Pixora Craftt!

Hi ${firstName},

Welcome to Pixora Craftt! We're excited to have you on board.

To get started, please verify your email address by visiting this link:
${verificationUrl}

This verification link will expire in 30 minutes for security reasons.

If you didn't create an account with us, please ignore this email.

Best regards,
The Pixora Craftt Team

© ${new Date().getFullYear()} Pixora Craftt. All rights reserved.
    `.trim();
  }

  private generateVerificationEmailHtml(firstName: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Pixora Craftt</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName},</h2>
            <p>Please verify your email address to complete your account setup.</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p>This verification link will expire in 30 minutes for security reasons.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
            <p>Best regards,<br>The Pixora Craftt Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Pixora Craftt. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateVerificationEmailText(firstName: string, verificationUrl: string): string {
    return `
Verify Your Email - Pixora Craftt

Hi ${firstName},

Please verify your email address to complete your account setup.

Verification link: ${verificationUrl}

This verification link will expire in 30 minutes for security reasons.

If you didn't request this verification, please ignore this email.

Best regards,
The Pixora Craftt Team

© ${new Date().getFullYear()} Pixora Craftt. All rights reserved.
    `.trim();
  }

  private generatePasswordResetEmailHtml(firstName: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - Pixora Craftt</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName},</h2>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #ef4444;">${resetUrl}</p>
            <p>This password reset link will expire in 15 minutes for security reasons.</p>
            <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
            <p>Best regards,<br>The Pixora Craftt Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Pixora Craftt. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generatePasswordResetEmailText(firstName: string, resetUrl: string): string {
    return `
Reset Your Password - Pixora Craftt

Hi ${firstName},

We received a request to reset your password. Visit this link to set a new password:
${resetUrl}

This password reset link will expire in 15 minutes for security reasons.

If you didn't request a password reset, please ignore this email and your password will remain unchanged.

Best regards,
The Pixora Craftt Team

© ${new Date().getFullYear()} Pixora Craftt. All rights reserved.
    `.trim();
  }

  private generatePasswordChangedEmailHtml(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed - Pixora Craftt</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Changed Successfully</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName},</h2>
            <p>Your password has been changed successfully. If you made this change, no further action is required.</p>
            <p>If you didn't change your password, please contact our support team immediately.</p>
            <p>For your security, we recommend:</p>
            <ul>
              <li>Using a unique, strong password</li>
              <li>Enabling two-factor authentication</li>
              <li>Not sharing your password with anyone</li>
            </ul>
            <p>Best regards,<br>The Pixora Craftt Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Pixora Craftt. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generatePasswordChangedEmailText(firstName: string): string {
    return `
Password Changed Successfully - Pixora Craftt

Hi ${firstName},

Your password has been changed successfully. If you made this change, no further action is required.

If you didn't change your password, please contact our support team immediately.

For your security, we recommend:
- Using a unique, strong password
- Enabling two-factor authentication
- Not sharing your password with anyone

Best regards,
The Pixora Craftt Team

© ${new Date().getFullYear()} Pixora Craftt. All rights reserved.
    `.trim();
  }

  private generateLoginAlertEmailHtml(firstName: string, loginDetails: { ip: string; device: string; location?: string; time: Date }): string {
    const timeStr = loginDetails.time.toLocaleString();
    const location = loginDetails.location || 'Unknown location';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Login Alert - Pixora Craftt</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .alert-box { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin: 20px 0; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Login Alert</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName},</h2>
            <p>We detected a new login to your Pixora Craftt account.</p>
            <div class="alert-box">
              <h3>Login Details:</h3>
              <p><strong>Time:</strong> ${timeStr}</p>
              <p><strong>Device:</strong> ${loginDetails.device}</p>
              <p><strong>IP Address:</strong> ${loginDetails.ip}</p>
              <p><strong>Location:</strong> ${location}</p>
            </div>
            <p>If this was you, you can safely ignore this email.</p>
            <p>If you don't recognize this login, please secure your account immediately by:</p>
            <ul>
              <li>Changing your password</li>
              <li>Enabling two-factor authentication</li>
              <li>Reviewing your account settings</li>
            </ul>
            <p>Best regards,<br>The Pixora Craftt Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Pixora Craftt. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateLoginAlertEmailText(firstName: string, loginDetails: { ip: string; device: string; location?: string; time: Date }): string {
    const timeStr = loginDetails.time.toLocaleString();
    const location = loginDetails.location || 'Unknown location';
    
    return `
New Login Alert - Pixora Craftt

Hi ${firstName},

We detected a new login to your Pixora Craftt account.

Login Details:
- Time: ${timeStr}
- Device: ${loginDetails.device}
- IP Address: ${loginDetails.ip}
- Location: ${location}

If this was you, you can safely ignore this email.

If you don't recognize this login, please secure your account immediately by:
- Changing your password
- Enabling two-factor authentication
- Reviewing your account settings

Best regards,
The Pixora Craftt Team

© ${new Date().getFullYear()} Pixora Craftt. All rights reserved.
    `.trim();
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.isConfigured) {
      return false;
    }

    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed', error);
      return false;
    }
  }
} 