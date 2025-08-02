import { UserRole } from '../shared/enums/user-role.enum';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  lastLogin?: string | Date;
  lastLoginIp?: string;
  timezone?: string;
  language?: string;
  preferences?: UserPreferences;
  metadata?: Record<string, any>;
  tenantId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    marketing?: boolean;
    reminders?: boolean;
  };
  privacy?: {
    profileVisibility?: 'public' | 'connections' | 'private';
    emailVisibility?: 'public' | 'connections' | 'private';
    phoneVisibility?: 'public' | 'connections' | 'private';
  };
  [key: string]: any;
}

export interface UserProfile extends Omit<User, 'password' | 'tokens'> {
  // Additional profile-specific fields can be added here
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    [key: string]: string | undefined;
  };
}

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
  usersByRole: Record<UserRole, number>;
  lastUpdated: string | Date;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: string | Date;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string | Date;
  lastActivityAt?: string | Date;
  isRevoked?: boolean;
  metadata?: Record<string, any>;
  createdAt: string | Date;
  updatedAt: string | Date;
}
