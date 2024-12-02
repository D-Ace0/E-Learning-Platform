import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { MailService } from '../mail/mail.service';

@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);

  constructor(private mailService: MailService) {}

  generateSecret() {
    const secret = speakeasy.generateSecret({ length: 20 });
    return secret.base32;
  }

  verifyToken(secret: string, token: string) {
    this.logger.log('Verification Attempt Details:');
    this.logger.log(`Secret: ${secret}`);
    this.logger.log(`Provided Token: ${token}`);
  
    // Generate the expected OTP for logging
    const expectedOtp = this.generateCurrentOtp(secret);
    this.logger.log(`Expected OTP: ${expectedOtp}`);
  
    const tokenString = token.trim().replace(/\s/g, '');
  
    // Verify the token using the speakeasy library with the updated step
    const verificationResults = [
      speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: tokenString,
        step: 3600, // 1 hour
        window: 2, // Allow a window for time drift
      }),
      speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: tokenString,
        step: 3600, // 1 hour
        window: 1,
      }),
    ];
  
    this.logger.log(
      `Verification Results (no window, 1-step window): ${verificationResults[0]}, ${verificationResults[1]}`
    );
  
    // If either verification passes, return true
    if (verificationResults[0] || verificationResults[1]) {
      return true;
    }
  
    throw new UnauthorizedException('Invalid MFA token');
  }
  
  generateCurrentOtp(secret: string) {
    const otp = speakeasy.totp({
      secret,
      encoding: 'base32',
      step: 3600, // 1 hour
    });
  
    this.logger.log(`Generated OTP: ${otp}`);
    return otp;
  }
  

  async sendOtpEmail(secret: string, email: string, user: any) {
    const otp = this.generateCurrentOtp(secret);

    this.logger.log('Sending OTP Email:');
    this.logger.log(`Email: ${email}`);
    this.logger.log(`Secret: ${secret}`);
    this.logger.log(`Generated OTP: ${otp}`);

    // Additional verification for debugging
    const verificationTest = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: otp,
    });
    this.logger.log(`Self-Verification of OTP: ${verificationTest}`);

    const subject = 'Your OTP Code - Expiry Notice';
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // OTP expiry time (5 minutes)
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
              font-size: 24px;
              font-weight: bold;
              color: #4CAF50;
              margin: 20px 0;
              text-align: center;
            }
            .expiry-info {
              font-size: 14px;
              color: #888;
            }
            .footer {
              font-size: 12px;
              color: #888;
              text-align: center;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h2>Your OTP Code</h2>
            </div>
            <div class="email-body">
              <p>Hello!</p>
              <p>We received a request to verify your identity. Please use the OTP code below to complete the verification process.</p>
              <div class="otp-code">${otp}</div>
              <p class="expiry-info">This OTP code will expire at <strong>${formattedExpiryTime}</strong>. Please use it before the time runs out.</p>
            </div>
            <div class="footer">
              <p>If you did not request this code please disregard it.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send OTP email
    await this.mailService.sendMail({
      to: email,
      subject: subject,
      text: `Your OTP code is: ${otp}`,
      html: htmlContent,
    });
  }
}
