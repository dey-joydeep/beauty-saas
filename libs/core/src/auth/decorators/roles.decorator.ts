import { SetMetadata } from '@nestjs/common';
import { AppUserRole } from '../../../../shared/src/types/user.types';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: AppUserRole[]) => SetMetadata(ROLES_KEY, roles);
