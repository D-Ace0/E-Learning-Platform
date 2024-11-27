import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = this.exractTokenFromHeader(request);

      if (!token) throw new UnauthorizedException("");

      request.user = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_SECRET });
    } catch (error) {
      throw new UnauthorizedException("");
    }

    return true;
  }

  private exractTokenFromHeader(request: Request) {
    return request.cookies['auth_token']; // Extract token from cookies
  }
}
