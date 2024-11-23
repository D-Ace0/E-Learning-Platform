import { Body, Controller, Post } from '@nestjs/common'
import { AuthPayloadDTO } from './dto/auth.dto'
import { AuthService } from './auth.service'
import { SignupDTO } from './dto/signup.dto'
import { CurrentUser } from '../decorators/current-user.decorator' 
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signUpData: SignupDTO) {
    return this.authService.signup(signUpData)
  }

  @Post('login')
  async login(@Body() authPayloadDTO: AuthPayloadDTO) {
    return this.authService.login(authPayloadDTO)
  }
  
  @Post('enable-mfa')
async enableMFA(@Body('user_id') user_id: string) {
    const response = await this.authService.enableMFA(user_id)
    return response
}
  @Post('get-otp')
async getOtp(@Body('user_id') user_id: string) {
    return this.authService.getCurrentOtp(user_id)
}

@Post('disable-mfa')
async disableMFA(@Body('user_id') user_id: string) {
    const response = await this.authService.disableMFA(user_id)
    return response
}
}