import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = this.exractTokenFromHeader(request);

      if (!token) throw new UnauthorizedException("");

      request.user = await this.jwtService.verify(token, { secret: "dd29fce76b99ff2fc7c81ae157e38c06a3af27aad0da29274b5521bc190f4804" });
    } catch (error) {
      throw new UnauthorizedException("");
    }

    return true;
  }

  private exractTokenFromHeader(request: Request) {
    const [type, token] = request.headers.authorization.split(' ') ?? [];
    return type == 'Bearer' ? token : undefined;
  }
}
