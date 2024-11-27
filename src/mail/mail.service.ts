import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',  
      auth: {
        user: process.env.FROM_EMAIL,  
        pass: process.env.FROM_EMAIL_PASSWORD,  
      },
    });
  }

  // Send email with optional HTML content
  async sendMail(
    to: string,          // To email address
    subject: string,     // Email subject
    text: string,        // Email text content
    from: string = process.env.FROM_EMAIL,  // Default 'from' to environment variable if not provided
    html?: string        // Optional HTML content (if not provided, fallback to text)
  ) {
    const mailOptions = {
      from: from,  // 'From' email is now guaranteed to be passed (either via argument or environment variable)
      to: to,
      subject: subject,
      text: text,
      html: html || text,  // If 'html' is not provided, fallback to 'text'
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
