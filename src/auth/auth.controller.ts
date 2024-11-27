<<<<<<< Updated upstream
import { Body, Controller, Post } from '@nestjs/common';
import { AuthPayloadDTO } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { SignupDTO } from './dto/signup.dto';
=======
import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common'
import { SignInDTO } from './dto/signin'
import { AuthService } from './auth.service'
import { SignupDTO } from './dto/signup.dto'
import { AuthenticationGuard } from 'src/guards/authentication.guard'

>>>>>>> Stashed changes

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signUpData: SignupDTO) {
    return this.authService.signup(signUpData);
  }

  @Post('login')
<<<<<<< Updated upstream
  async login(@Body() authPayloadDTO: AuthPayloadDTO) {
    return this.authService.login(authPayloadDTO);
  }
=======
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
>>>>>>> Stashed changes

  @Post('enable-mfa')
  async enableMFA(@Body('user_id') user_id: string) {
    const response = await this.authService.enableMFA(user_id);
    return response;
  }

  @Post('disable-mfa')
  async disableMFA(@Body('user_id') user_id: string) {
    const response = await this.authService.disableMFA(user_id);
    return response;
  }
}
