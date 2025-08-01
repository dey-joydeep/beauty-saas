
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError, firstValueFrom, from } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { NotificationService } from '../../services/notification.service';
import { StorageService } from '../../services/storage.service';

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
  private readonly apiUrl = '/api/auth';
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';
  private readonly USER_KEY = 'current_user';

  private readonly isBrowser: boolean;
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();
  private refreshTokenInterval: any = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private router: Router,
    private storage: StorageService,
    private notificationService: NotificationService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      this.initializeAuthState();
      this.setupTokenRefresh();
    }
  }

  login(credentials: LoginCredentials): Observable<AuthUser> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials).pipe(
      map((response) => this.handleAuthResponse(response)),
      catchError((error) => this.handleAuthError(error))
    );
  }

  initLogin(credentials: LoginCredentials): Observable<InitLoginResponse> {
    return this.http.post<ApiResponse<InitLoginResponse>>(`${this.apiUrl}/login/init`, credentials).pipe(
      map((response) => {
        if (!response.success) {
          throw new Error(response.error || 'Login initialization failed');
        }
        return response.data!;
      })
    );
  }

  verifyOtp(params: VerifyOtpParams): Observable<AuthUser> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/verify-otp`, params).pipe(
      map((response) => this.handleAuthResponse(response)),
      catchError((error) => this.handleAuthError(error))
    );
  }

  socialLogin(provider: 'google' | 'facebook', token: string): Observable<AuthUser> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/social/${provider}`, { token }).pipe(
      map((response) => this.handleAuthResponse(response)),
      catchError((error) => this.handleAuthError(error))
    );
  }

  async logout(): Promise<Observable<boolean>> {
    this.clearAuthData();
    try {
      const token = await this.getToken();
      if (token) {
        return this.http.post<ApiResponse>(`${this.apiUrl}/logout`, {}).pipe(
          map(() => true),
          catchError(() => of(true)),
          tap(() => {
            this.router.navigate(['/auth/login']);
          })
        );
      }
      this.router.navigate(['/auth/login']);
      return of(true);
    } catch (error) {
      console.error('Error during logout:', error);
      this.router.navigate(['/auth/login']);
      return of(true);
    }
  }

  requestPasswordReset(email: string): Observable<boolean> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/forgot-password`, { email }).pipe(
      map((response) => response.success)
    );
  }

  resetPassword(token: string, newPassword: string): Observable<boolean> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/reset-password`, { token, newPassword }).pipe(
      map((response) => response.success)
    );
  }

  register(data: { name: string; email: string; password: string; role?: string }): Observable<{ user: any }> {
    return this.http.post<{ user: any }>(`${this.apiUrl}/user/register`, data).pipe(
      catchError((error: any) => this.handleAuthError(error))
    );
  }

  resendOtp(email: string): Observable<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(`${this.apiUrl}/login/resend-otp`, { email }).pipe(
      catchError((error: any) => this.handleAuthError(error))
    );
  }

  async isAuthenticated(): Promise<boolean> {
    if (!this.isBrowser) return false;
    
    try {
      const token = await this.getToken();
      if (!token) return false;
      
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp > currentTime;
      } catch (error) {
        console.error('Error validating token:', error);
        return false;
      }
    } catch (error) {
      console.error('Error getting token:', error);
      return false;
    }
  }

  private isTokenValid(token: string | null | undefined): boolean {
    if (!token) return false;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  private initializeAuthState(): void {
    if (!this.isBrowser) return;
    
    this.storage.getItem<AuthUser>(this.USER_KEY).subscribe({
      next: (user) => {
        if (user) {
          this.currentUserSubject.next(user);
        }
      },
      error: (error) => {
        console.error('Failed to load user from storage', error);
        this.clearAuthData();
      }
    });
  }

  private handleAuthResponse(response: ApiResponse<AuthResponse>): AuthUser {
    const { data } = response;
    const user = { ...data };
    this.setLoggedInUser(user);
    return user;
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred during authentication';
    if (error.error instanceof ErrorEvent) {
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

  private clearAuthData(): void {
    if (!this.isBrowser) return;
    
    // Clear from storage
    this.storage.removeItem(this.TOKEN_KEY).subscribe();
    this.storage.removeItem(this.REFRESH_TOKEN_KEY).subscribe();
    this.storage.removeItem(this.TOKEN_EXPIRY_KEY).subscribe();
    this.storage.removeItem(this.USER_KEY).subscribe();
    
    // Clear in-memory data
    this.currentUserSubject.next(null);
    
    // Clear any pending refresh token attempts
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
      this.refreshTokenInterval = null;
    }
  }

  private setLoggedInUser(user: AuthUser): void {
    if (!this.isBrowser) return;
    
    // Update in-memory user
    this.currentUserSubject.next(user);
    
    // Update storage
    this.storage.setItem(this.USER_KEY, user).subscribe({
      error: (error) => {
        console.error('Failed to save user to storage:', error);
      }
    });
  }

  private async getToken(): Promise<string | null> {
    if (!this.isBrowser) return null;
    try {
      return await firstValueFrom(this.storage.getItem<string>(this.TOKEN_KEY));
    } catch (error) {
      console.error('Error getting token from storage:', error);
      return null;
    }
  }

  private async getRefreshToken(): Promise<string | null> {
    if (!this.isBrowser) return null;
    try {
      return await firstValueFrom(this.storage.getItem<string>(this.REFRESH_TOKEN_KEY));
    } catch (error) {
      console.error('Error getting refresh token from storage:', error);
      return null;
    }
  }

  private setupTokenRefresh(): void {
    if (!this.isBrowser) return;
    
    // Clear any existing interval
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
    }
    
    // Refresh token 5 minutes before it expires
    const refreshThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    const checkTokenExpiry = () => {
      this.storage.getItem<string>(this.TOKEN_EXPIRY_KEY).pipe(
        switchMap(expiry => {
          if (!expiry) return of(undefined);
          
          const expiryTime = parseInt(expiry, 10);
          const currentTime = new Date().getTime();
          const timeUntilExpiry = expiryTime - currentTime;
          
          if (timeUntilExpiry <= refreshThreshold) {
            return this.refreshToken().pipe(
              catchError((error: Error) => {
                console.error('Failed to refresh token:', error);
                return this.logout();
              })
            );
          }
          return of(undefined);
        }),
        catchError((error: Error) => {
          console.error('Error checking token expiry:', error);
          return of(undefined);
        })
      ).subscribe();
    };
    
    // Initial check
    checkTokenExpiry();
    
    // Check every minute
    this.refreshTokenInterval = setInterval(checkTokenExpiry, 60000);
  }

  private refreshToken(): Observable<AuthUser> {
    return from(this.getRefreshToken()).pipe(
      switchMap(refreshToken => {
        if (!refreshToken) {
          this.clearAuthData();
          return throwError(() => new Error('No refresh token available'));
        }
        return this.http.post<ApiResponse<AuthResponse>>(
          `${this.apiUrl}/refresh-token`, 
          { refreshToken }
        ).pipe(
          map((response) => this.handleAuthResponse(response)),
          catchError((error: Error) => {
            this.clearAuthData();
            this.router.navigate(['/auth/login']);
            return throwError(() => error);
          })
        );
      })
    );
  }
}
