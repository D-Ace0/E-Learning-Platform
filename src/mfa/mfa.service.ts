import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { MailService } from '../mail/mail.service';  

@Injectable()
export class MfaService {
  constructor(private mailService: MailService) {}


  generateSecret() {
    const secret = speakeasy.generateSecret({ length: 20 });
    return secret.base32;
  }

 
  verifyToken(secret: string, token: string) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    });
  }

  
  generateCurrentOtp(secret: string) {
    return speakeasy.totp({
      secret,
      encoding: 'base32',
      step: 300,  
    });
  }

 
  async sendOtpEmail(secret: string, email: string) {
    const otp = this.generateCurrentOtp(secret);  
    const subject = 'Your OTP Code - Expiry Notice';
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000); 
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
              margin: 0 auto;
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
              <p>Hello,</p>
              <p>We received a request to verify your identity. Please use the OTP code below to complete the verification process.</p>
              <div class="otp-code">
                ${otp}
              </div>
              <p class="expiry-info">
                This OTP code will expire at <strong>${formattedExpiryTime}</strong>. Please use it before the time runs out.
              </p>
            </div>
            <div class="footer">
              <p>If you did not request this code, please disregard this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  
    await this.mailService.sendMail({
      to: email,
      subject: subject,
      text: `Your OTP code is: ${otp}`, 
      html: htmlContent 
    })
  }
  
}
