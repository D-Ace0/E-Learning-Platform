import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from 'src/schemas/user.schema'
import { MfaModule } from '../mfa/mfa.module' 

@Module({
  controllers: [AuthController],
  providers: [AuthService], 
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' }
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AuthenticationLog.name, schema: AuthenticationLogSchema }, 
    ]),
    MfaModule, 
  ]
})
export class AuthModule {}
