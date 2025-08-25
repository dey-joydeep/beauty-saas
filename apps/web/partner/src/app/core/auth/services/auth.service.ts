import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { StorageService } from '@beauty-saas/web-core/http';
import type { AuthStatePort, BaseAuthUser } from '@beauty-saas/web-core/auth';

export interface AuthUser extends BaseAuthUser {
  readonly email?: string;
  readonly name?: string;
  readonly role?: string;
  readonly accessToken?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService implements AuthStatePort {
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'current_user';

  private readonly isBrowser: boolean;
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private storage: StorageService,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.initializeAuthState();
    }
  }

  /**
   * Minimal user view required by core auth (BaseAuthUser)
   */
  getCurrentUser(): BaseAuthUser | null {
    const u = this.currentUserSubject.value;
    return u ? { id: u.id } : null;
  }

  // All HTTP flows are handled by partner auth library services.

  async isAuthenticated(): Promise<boolean> {
    if (!this.isBrowser) return false;

    try {
      const token = await firstValueFrom(this.getToken());
      return this.isTokenValid(token);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  private isTokenValid(token: string | null | undefined): boolean {
    if (!token) return false;

    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return false;

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

    // Use getItem$ for Observable-based access
    this.storage.getItem$<AuthUser>(this.USER_KEY).subscribe({
      next: (user: AuthUser | null) => {
        if (user) {
          this.currentUserSubject.next(user);
        }
      },
      error: (error: Error) => {
        console.error('Failed to load user from storage', error);
        this.clearAuthData();
      },
    });
  }

  private clearAuthData(): void {
    if (!this.isBrowser) return;

    // Clear from storage using Observable-based methods
    forkJoin([
      this.storage.removeItem$(this.TOKEN_KEY),
      this.storage.removeItem$(this.USER_KEY),
    ]).subscribe({
      next: () => {
        // All storage items cleared successfully
      },
      error: (error) => {
        console.error('Error clearing auth data:', error);
      },
      complete: () => {
        // Clear in-memory data after storage is cleared
        this.currentUserSubject.next(null);
      },
    });
  }

  public setLoggedInUser(user: AuthUser): void {
    if (!this.isBrowser) return;

    // Update in-memory user
    this.currentUserSubject.next(user);

    // Update storage using Observable-based method
    this.storage.setItem$(this.USER_KEY, user).subscribe({
      next: () => {
        // Successfully saved to storage
      },
      error: (error: Error) => {
        console.error('Failed to save user to storage:', error);
      },
    });
  }

  private getToken(): Observable<string | null> {
    if (!this.isBrowser) {
      return of(null);
    }
    return this.storage.getItem$<string>(this.TOKEN_KEY).pipe(
      catchError(() => of(null)),
    );
  }
}
