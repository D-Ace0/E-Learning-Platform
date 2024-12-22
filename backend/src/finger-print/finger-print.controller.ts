import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FingerPrintService } from './finger-print.service';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { ResourceAccessGuard } from 'src/guards/resource-access.guard';

@UseGuards(AuthenticationGuard, AuthorizationGuard, ResourceAccessGuard)
@Controller('fingerprint')
export class FingerPrintController {
  constructor(private readonly fingerPrintService: FingerPrintService) {}

  @Post('register')
  @Roles(['instructor', 'student'])
  async registerFingerprint(
    @Body('userId') userId: string,
    @Body('fingerprint') fingerprint: string,
  ) {
   
    return this.fingerPrintService.registerFingerprint(userId, fingerprint);
    
  }

  @Post('verify')
  @Roles(['instructor', 'student'])
  async verifyFingerprint(
    @Body('userId') userId: string,
    @Body('fingerprint') fingerprint: string,
  ) {
    
    return this.fingerPrintService.verifyFingerprint(userId, fingerprint);
  }
}
