import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common'
import { SignInDTO } from './dto/signin'
import { AuthService } from './auth.service'
import { SignupDTO } from './dto/signup.dto'
import { AuthenticationGuard } from 'src/guards/authentication.guard'


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signUpData: SignupDTO) {
    return this.authService.signup(signUpData);
  }

  @Post('login')
  async login(@Body() authPayloadDTO: SignInDTO) {
    return this.authService.login(authPayloadDTO)
  }
  
  @Post('enable-mfa')
  @UseGuards(AuthenticationGuard)
async enableMFA(@Request() req: any) {
    const user_id = req.user.user_id
    const response = await this.authService.enableMFA(user_id)
    return response
}
  @Post('get-otp')
async getOtp(@Body('user_id') user_id: string) {
    return this.authService.getCurrentOtp(user_id)
}


  @Post('disable-mfa')
  async disableMFA(@Body('user_id') user_id: string) {
    const response = await this.authService.disableMFA(user_id);
    return response;
  }
}
