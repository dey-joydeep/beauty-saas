// Define our local UserRole enum to be used in decorators and type checking
export enum AppUserRole {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER'
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: AppUserRole[];
  tenantId?: string;
  [key: string]: unknown;
}
