export interface LoginCredentials {
  email: string;
  password: string;
}

export interface OtpVerificationParams {
  email: string;
  otp: string;
  password: string;
}

export interface InitLoginResponse {
  token?: string;
  userType?: 'customer' | 'owner' | 'staff';
  requiresOtp?: boolean;
  message?: string;
}

export interface OtpVerificationResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatar?: string;
  };
  message?: string;
}

export interface SocialLoginPayload {
  provider: 'google' | 'facebook' | 'apple';
  token: string;
  userType: 'customer' | 'owner' | 'staff';
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatar?: string;
  };
  message?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
