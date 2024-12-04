import { Body, Controller, HttpCode, Post, Request, Res, UseGuards } from '@nestjs/common';
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
  @HttpCode(200)  // Status code for success
  async login(
    @Body() signInDTO: SignInDTO,  // Request body for sign-in
    @Res() response: Response       // Response object to set the cookie
  ) {
    // Call login method from AuthService and pass the response object for setting cookies
    return this.authService.login(signInDTO, response);
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