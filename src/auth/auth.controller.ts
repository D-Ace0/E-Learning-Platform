import { Body, Controller, Post, Request, Res, UseGuards } from '@nestjs/common'
import { SignInDTO } from './dto/signin'
import { AuthService } from './auth.service'
import { SignupDTO } from './dto/signup.dto'
import { AuthenticationGuard } from 'src/guards/authentication.guard'
import { Response } from 'express'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signUpData: SignupDTO) {
    return this.authService.signup(signUpData);
  }

  @Post('login')
  async login(@Body() authPayloadDTO: SignInDTO, @Res() response: Response) {
    return this.authService.login(authPayloadDTO, response)
  }

  @Post('logout')
  @UseGuards(AuthenticationGuard)
  async logout(@Res() response: Response) {
    return await this.authService.signOut(response);
  }
  
  @Post('enable-mfa')
  @UseGuards(AuthenticationGuard)
async enableMFA(@Request() req: any) {
    const user_id = req.user.user_id
    const response = await this.authService.enableMFA(user_id)
    return response
}

  @Post('disable-mfa')
  @UseGuards(AuthenticationGuard)
  async disableMFA(@Request() req: any) {
    const user_id = req.user.user_id
    const response = await this.authService.disableMFA(user_id);
    return response;
  }
}
