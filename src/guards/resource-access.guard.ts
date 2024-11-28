import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ResourceAccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    // Admin has access to everything
    if (user.role === 'admin') {
      return true;
    }

    // For accessing user-specific routes
    if (params.id) {
      // Allow users to access only their own data
      if (user.role === 'student' || user.role === 'instructor') {
        if (user.user_id !== params.id) {
          throw new ForbiddenException('You are not allowed to access other users\' data');
        }
        return true;
      }
    }

    return true;
  }
}