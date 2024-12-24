import { Injectable, UnauthorizedException, Logger, BadRequestException } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { MailService } from '../mail/mail.service';

const MFA_CONSTANTS = {
  SECRET_LENGTH: 32, // Increased for better security
  TOKEN_STEP: 300, // 5 minutes
  TOKEN_WINDOW: 1, // Stricter window
  MAX_ATTEMPTS: 3,
  LOCKOUT_TIME: 1800, // 30 minutes in seconds
  OTP_EXPIRY: 300000, // 5 minutes in milliseconds
};

@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);
  private failedAttempts = new Map<string, { count: number; lastFailure: number }>();

  constructor(private mailService: MailService) {}

  generateSecret() {
    const secret = speakeasy.generateSecret({ 
      length: MFA_CONSTANTS.SECRET_LENGTH,
      name: process.env.APP_NAME || 'E-Learning Platform'
    });
    return secret.base32;
  }

  private checkRateLimit(userId: string): void {
    const userAttempts = this.failedAttempts.get(userId);
    if (!userAttempts) return;

    const now = Math.floor(Date.now() / 1000);
    if (userAttempts.count >= MFA_CONSTANTS.MAX_ATTEMPTS) {
      const timeSinceLastFailure = now - userAttempts.lastFailure;
      if (timeSinceLastFailure < MFA_CONSTANTS.LOCKOUT_TIME) {
        const remainingTime = MFA_CONSTANTS.LOCKOUT_TIME - timeSinceLastFailure;
        throw new UnauthorizedException(
          `Too many failed attempts. Please try again in ${Math.ceil(remainingTime / 60)} minutes.`
        );
      } else {
        // Reset after lockout period
        this.failedAttempts.delete(userId);
      }
    }
  }

  private recordFailedAttempt(userId: string): void {
    const now = Math.floor(Date.now() / 1000);
    const userAttempts = this.failedAttempts.get(userId) || { count: 0, lastFailure: now };
    
    userAttempts.count += 1;
    userAttempts.lastFailure = now;
    
    this.failedAttempts.set(userId, userAttempts);
  }

  verifyToken(secret: string, token: string, userId: string) {
    if (!secret || !token) {
      throw new BadRequestException('Invalid MFA parameters');
    }

    this.checkRateLimit(userId);

    const tokenString = token.trim().replace(/\s/g, '');
    
    try {
      const isValid = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: tokenString,
        step: MFA_CONSTANTS.TOKEN_STEP,
        window: MFA_CONSTANTS.TOKEN_WINDOW,
      });

      if (!isValid) {
        this.recordFailedAttempt(userId);
        throw new UnauthorizedException('Invalid MFA token');
      }

      // Reset failed attempts on successful verification
      this.failedAttempts.delete(userId);
      return true;
    } catch (error) {
      this.logger.error(`MFA verification failed for user ${userId}`, error);
      throw new UnauthorizedException('Invalid MFA token');
    }
  }

  generateCurrentOtp(secret: string): string {
    if (!secret) {
      throw new BadRequestException('Invalid MFA secret');
    }

    return speakeasy.totp({
      secret,
      encoding: 'base32',
      step: MFA_CONSTANTS.TOKEN_STEP,
    });
  }

  async sendOtpEmail(secret: string, email: string, user: any) {
    if (!secret || !email) {
      throw new BadRequestException('Invalid parameters for OTP email');
    }

    const otp = this.generateCurrentOtp(secret);
    const expiryTime = new Date(Date.now() + MFA_CONSTANTS.OTP_EXPIRY);
    const formattedExpiryTime = expiryTime.toLocaleTimeString();

    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f7fc;
            }
            .email-container {
              width: 100%;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              max-width: 600px;
              margin: auto;
            }
            .email-header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .email-body {
              padding: 20px;
              font-size: 16px;
              line-height: 1.5;
            }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              color: #4CAF50;
              margin: 20px 0;
              text-align: center;
              letter-spacing: 4px;
              font-family: monospace;
            }
            .expiry-info {
              font-size: 14px;
              color: #dc3545;
              background: #fff3f3;
              padding: 10px;
              border-radius: 4px;
              text-align: center;
              margin: 20px 0;
            }
            .security-notice {
              font-size: 13px;
              color: #666;
              background: #f8f9fa;
              padding: 10px;
              border-radius: 4px;
              margin-top: 20px;
            }
            .footer {
              font-size: 12px;
              color: #888;
              text-align: center;
              margin-top: 20px;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h2>Security Verification Code</h2>
            </div>
            <div class="email-body">
              <p>Hello ${user.name},</p>
              <p>A verification code has been requested for your account. Please use the following code to complete the verification process:</p>
              <div class="otp-code">${otp}</div>
              <div class="expiry-info">
                ⚠️ This code will expire at ${formattedExpiryTime}
              </div>
              <div class="security-notice">
                <strong>Security Notice:</strong>
                <ul>
                  <li>Never share this code with anyone</li>
                  <li>Our team will never ask for this code</li>
                  <li>If you didn't request this code, please secure your account</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply.</p>
              <p>If you did not request this code, please contact support immediately.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await this.mailService.sendMail({
        to: email,
        subject: 'Security Verification Code - Action Required',
        text: `Your verification code is: ${otp}. This code will expire at ${formattedExpiryTime}. If you didn't request this code, please ignore this email.`,
        html: htmlContent,
      });

      this.logger.log(`MFA code sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send MFA code to ${email}`, error);
      throw new BadRequestException('Failed to send verification code');
    }
  }
}
