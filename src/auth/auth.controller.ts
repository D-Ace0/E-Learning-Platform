import { Body, Controller, Post, Request, Res, UseGuards } from '@nestjs/common';
import { SignInDTO } from './dto/signin';
import { AuthService } from './auth.service';
import { SignupDTO } from './dto/signup.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  
  @Post('signup')
  async signup(@Body() signUpData: SignupDTO) {
    const result = await this.authService.signup(signUpData);
    return result;
  }
  
  @Post('login')
  async login(@Body() authPayloadDTO: SignInDTO, @Res() response: Response) {
    const { message, token } = await this.authService.login(authPayloadDTO);
    
    if (token) {
      response.cookie('auth_token', token.accessToken, {
        httpOnly: true, // prevents XSS attacks
        // secure: process.env.NODE_ENV === 'production', // Uncomment for production
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
    
    return response.status(200).json({ message });
  }
  
  @Post('logout')
  @UseGuards(AuthenticationGuard)
  async logout(@Res() response: Response) {
    const result = await this.authService.signOut(response);
    return result;
  }
  
  @Post('enable-mfa')
  @UseGuards(AuthenticationGuard)
  async enableMFA(@Request() req: any) {
    const user_id = req.user.user_id;
    const response = await this.authService.enableMFA(user_id);
    return response;
  }
  
  @Post('disable-mfa')
  @UseGuards(AuthenticationGuard)
  async disableMFA(@Request() req: any) {
    const user_id = req.user.user_id;
    const response = await this.authService.disableMFA(user_id);
    return response;
  }
}