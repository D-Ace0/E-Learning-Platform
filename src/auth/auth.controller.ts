import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { AuthPayloadDTO } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { SignupDTO } from './dto/signup.dto';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService){}

    @Post('signup')
    async signup(@Body() signUpData: SignupDTO){
        return this.authService.signup(signUpData)
    }

    @Post('login')
    login(@Body() authPayloadDTO: AuthPayloadDTO){
        return this.authService.login(authPayloadDTO)
    }
}
