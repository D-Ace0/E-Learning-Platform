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


  async sendMail({
    to,
    subject,   
    text,     
    from = process.env.FROM_EMAIL, 
    html,       
  }: {
    to: string;
    subject: string;
    text: string;
    from?: string;
    html?: string;
  }) {
    
    const mailOptions = {
      from,  
      to,    
      subject,  
      text,  
      html: html || text,  
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
