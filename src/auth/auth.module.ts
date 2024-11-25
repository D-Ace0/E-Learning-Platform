import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from 'src/user/models/user.schema'
import { MfaModule } from '../mfa/mfa.module' 

@Module({
  controllers: [AuthController],
  providers: [AuthService], 
  imports: [
    JwtModule.register({
      global: true,
      secret: 'dd29fce76b99ff2fc7c81ae157e38c06a3af27aad0da29274b5521bc190f4804',
      signOptions: { expiresIn: '1h' }
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MfaModule, 
  ]
})
export class AuthModule {}