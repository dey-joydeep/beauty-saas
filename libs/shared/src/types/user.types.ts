import { UserRole } from '@prisma/client';

export enum AppUserRole {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER'
}

export interface UserRoleInfo {
  id: number;
  name: string;
}

export interface AuthenticatedUser {
  // Core user information
  id: string;
  email: string;
  name?: string;
  isVerified?: boolean;
  
  // Role information (support both string and object formats for backward compatibility)
  roles: UserRole[] | UserRoleInfo[];
  
  // Tenant information
  tenantId?: string;
  
  // Allow additional properties for flexibility
  [key: string]: unknown;
}

// Extend Express Request type to include our user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
