import { Module } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { MailModule } from '../mail/mail.module';  

@Module({
  imports: [MailModule],  
  providers: [MfaService],
  exports: [MfaService],  
})
export class MfaModule {}
