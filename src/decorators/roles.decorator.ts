import { SetMetadata } from '@nestjs/common';
import { user_role } from '../course/models/user.schema';

export const ROLES_KEY = 'role';
export const Roles = (roles: string[]) => SetMetadata(ROLES_KEY, roles);
