import { AppUserRole } from '@shared/types/user.types';

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: AppUserRole[];
  tenantId?: string;
  [key: string]: unknown;
}
