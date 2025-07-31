import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

// Models

// Services
import { NotificationService } from '../../services/notification.service';
import { StorageService } from '../../services/storage.service';

// Interfaces
interface VerifyPasswordResetParams {
  email: string;
  token: string;
  newPassword: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthResponse extends Omit<AuthUser, 'accessToken' | 'refreshToken' | 'expiresIn'> {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SocialLoginResponse {
  token: string;
  user: AuthUser;
  refreshToken: string;
  expiresIn: number;
}

export interface InitLoginResponse {
  userType: 'owner' | 'staff' | 'customer';
  token?: string;
  user?: AuthUser;
  requiresOtp?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyOtpParams {
  email: string;
  otp: string;
  type?: 'login' | 'reset' | 'verify';
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
  statusCode?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api/auth';
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';
  private readonly USER_KEY = 'current_user';

  private http = inject(HttpClient);
  private router = inject(Router);
  private storage = inject(StorageService);
  private notificationService = inject(NotificationService);

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.initializeAuthState();
    this.setupTokenRefresh();
  }

  // ========== AUTHENTICATION ==========

  /**
   * Login with email and password
   */
  login(credentials: LoginCredentials): Observable<AuthUser> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials).pipe(
      map((response) => this.handleAuthResponse(response)),
      catchError((error) => this.handleAuthError(error)),
    );
  }

  /**
   * Social login (Google, Facebook, etc.)
   */
  socialLogin(provider: 'google' | 'facebook', token: string): Observable<AuthUser> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/social/${provider}`, { token }).pipe(
      map((response) => this.handleAuthResponse(response)),
      catchError((error) => this.handleAuthError(error)),
    );
  }

  /**
   * Initialize login process (may trigger OTP)
   */
  initLogin(credentials: LoginCredentials): Observable<InitLoginResponse> {
    return this.http.post<ApiResponse<InitLoginResponse>>(`${this.apiUrl}/login/init`, credentials).pipe(
      map((response) => {
        if (!response.success) {
          throw new Error(response.error || 'Login initialization failed');
        }
        return response.data!;
      }),
    );
  }

  /**
   * Verify OTP for 2FA
   */
  verifyOtp(params: VerifyOtpParams): Observable<AuthUser> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/verify-otp`, params).pipe(
      map((response) => this.handleAuthResponse(response)),
      catchError((error) => this.handleAuthError(error)),
    );
  }

  /**
   * Logout the current user
   */
  logout(): Observable<boolean> {
    // Clear local storage and state
    this.clearAuthData();

    // Call server-side logout if token exists
    const token = this.getToken();
    if (token) {
      return this.http.post<ApiResponse>(`${this.apiUrl}/logout`, {}).pipe(
        map(() => true),
        catchError(() => of(true)), // Continue even if logout fails
        tap(() => {
          this.router.navigate(['/auth/login']);
        }),
      );
    }

    // If no token, just redirect
    this.router.navigate(['/auth/login']);
    return of(true);
  }

  // ========== PASSWORD RESET ==========

  /**
   * Request password reset
   */
  requestPasswordReset(email: string): Observable<boolean> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/forgot-password`, { email }).pipe(map((response) => response.success));
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Observable<boolean> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/reset-password`, { token, newPassword }).pipe(map((response) => response.success));
  }

  // ========== TOKEN MANAGEMENT ==========

  /**
   * Get the current access token
   */
  getToken(): string | null {
    const token = this.storage.getItemSync<string>(this.TOKEN_KEY);
    return token || null;
  }

  /**
   * Get the refresh token
   */
  getRefreshToken(): string | null {
    const token = this.storage.getItemSync<string>(this.REFRESH_TOKEN_KEY);
    return token || null;
  }

  /**
   * Check if a JWT token is valid (not expired)
   * @param token The JWT token to validate
   * @returns boolean indicating if the token is valid
   */
  isTokenValid(token: string | null): boolean {
    if (!token) return false;

    try {
      // Decode the token
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Check if token is expired using the token's own expiry
    if (this.isTokenValid(token)) {
      // Also check our stored expiry as an additional check
      const expiry = this.storage.getItemSync<string>(this.TOKEN_EXPIRY_KEY);
      if (expiry) {
        return new Date().getTime() < Number(expiry);
      }
      return true; // If no stored expiry but token is valid, assume valid
    }

    return false;
  }

  // ========== PRIVATE METHODS ==========

  /**
   * Initialize authentication state from storage
   */
  private initializeAuthState(): void {
    const token = this.getToken();
    const userStr = this.storage.getItemSync<string>('current_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as AuthUser;
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Failed to parse user data from storage', e);
        this.clearAuthData();
      }
    } else {
      this.clearAuthData();
    }
  }

  /**
   * Handle successful authentication response
   */
  private handleAuthResponse(response: ApiResponse<AuthResponse | AuthUser>): AuthUser {
    const { data } = response;
    let user: AuthUser;
    let accessToken: string | undefined;
    let refreshToken: string | undefined;
    let expiresIn: number | undefined;

    // Handle both AuthResponse and AuthUser types
    if ('accessToken' in data) {
      // This is an AuthResponse
      const { accessToken: token, refreshToken: refToken, expiresIn: expIn, ...userData } = data as AuthResponse;
      user = userData;
      accessToken = token;
      refreshToken = refToken;
      expiresIn = expIn;
    } else {
      // This is an AuthUser (tokens are optional)
      const { accessToken: token, refreshToken: refToken, expiresIn: expIn, ...userData } = data;
      user = userData as AuthUser;
      accessToken = token;
      refreshToken = refToken;
      expiresIn = expIn;
    }

    // Store tokens and user data if tokens are available
    if (accessToken) {
      this.storage.setItem(this.TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      this.storage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
    this.storage.setItem('current_user', JSON.stringify(user));

    // Calculate and store token expiry if expiresIn is available
    if (expiresIn) {
      const expiryTime = new Date().getTime() + expiresIn * 1000;
      this.storage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
    }

    // Update current user
    this.currentUserSubject.next(user);
    return user;
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred during authentication';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.status === 401) {
      errorMessage = 'Invalid email or password';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to access this resource';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    this.notificationService.showError(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    this.storage.removeItem(this.TOKEN_KEY);
    this.storage.removeItem(this.REFRESH_TOKEN_KEY);
    this.storage.removeItem(this.TOKEN_EXPIRY_KEY);
    this.storage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  /**
   * Set up token refresh mechanism
   */
  private setupTokenRefresh(): void {
    // Check token expiry periodically
    setInterval(() => {
      const token = this.getToken();
      const refreshToken = this.getRefreshToken();
      const expiry = this.storage.getItem(this.TOKEN_EXPIRY_KEY);

      if (token && refreshToken && expiry) {
        const expiresIn = Number(expiry) - new Date().getTime();

        // If token expires in less than 5 minutes, refresh it
        if (expiresIn < 5 * 60 * 1000) {
          this.refreshToken().subscribe();
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Refresh access token using refresh token
   */
  private refreshToken(): Observable<AuthUser> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearAuthData();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
      map((response) => this.handleAuthResponse(response)),
      catchError((error) => {
        this.clearAuthData();
        this.router.navigate(['/auth/login']);
        return throwError(() => error);
      }),
    );
  }

  // Register new user
  register(data: { name: string; email: string; password: string; role?: string }): Observable<{ user: any }> {
    return this.http
      .post<{ user: any }>(`${this.apiUrl}/user/register`, data)
      .pipe(catchError((error: any) => this.handleAuthError(error)));
  }

  /**
   * Resend OTP to the user's email
   * @param email The user's email address
   */
  resendOtp(email: string): Observable<{ success: boolean; message?: string }> {
    return this.http
      .post<{ success: boolean; message?: string }>(`${this.apiUrl}/login/resend-otp`, { email: email })
      .pipe(catchError((error: any) => this.handleAuthError(error)));
  }
}
