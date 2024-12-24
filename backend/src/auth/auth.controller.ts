import { Body, Controller, HttpCode, Post, Request, Res, UseGuards, Get, Param } from '@nestjs/common';
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
    return this.authService.login(authPayloadDTO, response)
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

  @Post('verify-mfa')
  @UseGuards(AuthenticationGuard)
  async verifyMFA(@Request() req: any, @Body() body: { code: string }) {
    const user_id = req.user.user_id;
    const response = await this.authService.verifyMFA(user_id, body.code);
    return response;
  }

  @Get('logs')
  @UseGuards(AuthenticationGuard)
  async getAuthenticationLogs(@Request() req: any) {
    return this.authService.getAuthenticationLogs(req.user.user_id);
  }

  @Get('logs/:userId')
  @UseGuards(AuthenticationGuard)
  async getUserAuthenticationLogs(@Request() req: any, @Param('userId') userId: string) {
    return this.authService.getUserAuthenticationLogs(req.user.user_id, userId);
  }
}