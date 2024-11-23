import { Injectable } from '@nestjs/common'
import * as speakeasy from 'speakeasy'

@Injectable()
export class MfaService {
  generateSecret(user_id: string) {
    const secret = speakeasy.generateSecret({ length: 20 })
    return {
      base32: secret.base32, 
    }
  }

  verifyToken(secret: string, token: string) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token
    })
  }
}