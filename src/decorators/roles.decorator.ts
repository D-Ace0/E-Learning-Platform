import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../schemas/user.schema';

export const ROLES_KEY = 'role';
export const Roles = (roles: string[]) => SetMetadata(ROLES_KEY, roles);