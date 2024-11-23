import { Injectable } from '@nestjs/common'
import * as speakeasy from 'speakeasy'

@Injectable()
export class MfaService {

  generateSecret() {
    const secret = speakeasy.generateSecret({ length: 20 })
    return secret.base32
  }

  verifyToken(secret: string, token: string) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token
    })
  }

  generateCurrentOtp(secret: string) {
    return speakeasy.totp({
      secret,
      encoding: 'base32',
      step: 300 // Time for each token before it expires doen by seconds
    })
  }
}