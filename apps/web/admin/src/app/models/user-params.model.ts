import { UserRole } from '@frontend-shared/shared/enums/user-role.enum';

export interface UserParams {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  lastLogin?: Date | string;
  preferences?: UserPreferences;
  metadata?: Record<string, any>;
}

export interface CreateUserParams extends Omit<UserParams, 'id' | 'isActive' | 'isEmailVerified' | 'isPhoneVerified' | 'lastLogin'> {
  password: string;
  sendWelcomeEmail?: boolean;
  requireEmailVerification?: boolean;
  requirePasswordChange?: boolean;
}

export interface UpdateUserParams extends Partial<Omit<UserParams, 'id' | 'email' | 'role'>> {
  id: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UserQueryParams {
  search?: string;
  role?: UserRole | UserRole[];
  isActive?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  createdAfter?: Date | string;
  createdBefore?: Date | string;
  lastLoginAfter?: Date | string;
  lastLoginBefore?: Date | string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserPreferences {
  language?: string;
  timezone?: string;
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    reminders?: boolean;
    promotions?: boolean;
    updates?: boolean;
  };
  privacy?: {
    showEmail?: boolean;
    showPhone?: boolean;
    showLastLogin?: boolean;
    showOnlineStatus?: boolean;
  };
  emailFrequency?: 'immediate' | 'daily' | 'weekly' | 'never';
  [key: string]: any;
}

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordParams {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordParams {
  email: string;
  resetUrl: string;
}

export interface VerifyEmailParams {
  token: string;
}

export interface UpdateProfileParams {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

export interface UserActivityParams {
  userId: string;
  action: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserSessionParams {
  id?: string;
  userId: string;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date | string;
  lastActivityAt?: Date | string;
  metadata?: Record<string, any>;
}
