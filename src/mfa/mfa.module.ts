import { Module } from '@nestjs/common'
import { MfaService } from './mfa.service'

@Module({
  providers: [MfaService],
  exports: [MfaService]
})
export class MfaModule {}