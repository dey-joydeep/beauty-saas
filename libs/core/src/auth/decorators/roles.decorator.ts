import { SetMetadata } from '@nestjs/common';
import { AppUserRole } from '@beauty-saas/shared';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: AppUserRole[]) => SetMetadata(ROLES_KEY, roles);
