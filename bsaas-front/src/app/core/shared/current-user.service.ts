import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { InitLoginResponse } from '../auth/auth-params.model';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  phone?: string;
  requiresOtp?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly isAuthenticated$ = this.currentUser$.pipe(map(user => !!user));
  
  // Store the URL so we can redirect after logging in
  redirectUrl: string | null = null;

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);
  
  constructor() {
    // Try to load user from localStorage on service initialization
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    const token = this.authService.getToken();
    const userJson = localStorage.getItem('currentUser');
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        // Verify token is still valid
        if (this.authService.isTokenValid(token)) {
          this.currentUserSubject.next(user);
          return;
        }
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
    
    // Clear invalid or expired session
    this.clearUser();
  }

  login(credentials: { email: string; password: string }): Observable<User> {
    return this.authService.initLogin(credentials).pipe(
      switchMap((response: InitLoginResponse) => {
        if (response.token) {
          // For customer login with direct token
          localStorage.setItem('authToken', response.token);
          return this.fetchUserProfile();
        } else if (response.userType) {
          // For owner/staff, wait for OTP verification
          return of({
            id: 'temp',
            email: credentials.email,
            firstName: '',
            lastName: '',
            role: response.userType,
            requiresOtp: true
          } as User);
        }
        throw new Error('Invalid login response');
      }),
      tap(user => {
        if (!user.requiresOtp) {
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          // Navigate to the redirect URL if available, otherwise to the dashboard
          const redirectUrl = this.redirectUrl || '/dashboard';
          this.redirectUrl = null;
          this.router.navigateByUrl(redirectUrl);
        }
      }),
      catchError(error => {
        console.error('Login failed', error);
        return throwError(() => error);
      })
    );
  }
  
  verifyOtp(otp: string): Observable<User> {
    if (!this.currentUser?.email) {
      return throwError(() => new Error('No user email available for OTP verification'));
    }

    return this.authService.verifyOtp({
      email: this.currentUser.email,
      otp,
      password: '' // Password should be handled securely in the backend
    }).pipe(
      switchMap(response => {
        if (!response.token) {
          throw new Error('No token received in OTP verification response');
        }
        
        localStorage.setItem('authToken', response.token);
        return this.fetchUserProfile();
      }),
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        const redirectUrl = this.redirectUrl || '/dashboard';
        this.redirectUrl = null;
        this.router.navigateByUrl(redirectUrl);
      }),
      catchError(error => {
        console.error('OTP verification failed', error);
        return throwError(() => error);
      })
    );
  }
  
  private fetchUserProfile(): Observable<User> {
    // In a real app, fetch user profile from your API
    // This is a mock implementation
    return of({
      id: '1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      avatar: 'assets/images/avatars/default-avatar.png'
    });
  }

  logout(): void {
    // Clear auth token and user data
    localStorage.removeItem('authToken');
    this.clearUser();
    
    // Navigate to login page
    this.router.navigate(['/auth/login']);
    
    // Clear any stored redirect URL
    this.redirectUrl = null;
  }

  clearUser(): void {
    // Clear all auth-related data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
  }

  updateUser(updates: Partial<User>): void {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
    }
  }
}
