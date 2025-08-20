import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, OnDestroy, PLATFORM_ID } from '@angular/core';
import { StorageService } from '@beauty-saas/web-core/http';
import { BehaviorSubject, Subject, timer } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, takeUntil } from 'rxjs/operators';
import { User } from '../../../models/user.model';
import { AUTH_STATE_PORT, type AuthStatePort } from '../ports/auth-state.port';

export type { User }; // Re-export User type for isolatedModules

const USER_STORAGE_KEY = 'current_user';

@Injectable({
  providedIn: 'root',
})
export class CurrentUserService implements OnDestroy {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private destroy$ = new Subject<void>();

  // Store the URL to redirect to after login
  public redirectUrl: string | null = null;

  // Public observable of the current user
  public currentUser$ = this.currentUserSubject.asObservable().pipe(
    distinctUntilChanged((prev, curr) => {
      if (prev === null && curr === null) return true;
      if (prev === null || curr === null) return false;
      return prev.id === curr.id;
    }),
    shareReplay(1),
  );

  // Public observable of the current user's ID
  public currentUserId$ = this.currentUser$.pipe(
    map((user) => user?.id || null),
    distinctUntilChanged(),
  );

  // Public observable of the current user's role
  public currentUserRole$ = this.currentUser$.pipe(
    map((user) => user?.role || null),
    distinctUntilChanged(),
  );

  // Public observable of the current user's authentication status
  public isAuthenticated$ = this.currentUser$.pipe(
    map((user) => !!user),
    distinctUntilChanged(),
  );

  constructor(
    private storage: StorageService,
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(AUTH_STATE_PORT) private authState: AuthStatePort,
  ) {
    // Only run in browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Load user from storage on init
      this.loadUserFromStorage();

      // Set up authentication state subscription
      this.setupAuthState();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Get the current user synchronously
   */
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get the current user ID synchronously
   */
  get currentUserId(): string | null {
    return this.currentUser?.id || null;
  }

  /**
   * Get the current user's role synchronously
   */
  get currentUserRole(): string | null {
    return this.currentUser?.role || null;
  }

  /**
   * Check if the current user has a specific role
   * @param role The role to check for
   */
  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  /**
   * Check if the current user has any of the specified roles
   * @param roles The roles to check for
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  /**
   * Update the current user
   * @param user The updated user object
   */
  updateUser(user: Partial<User>): void {
    if (!this.currentUser) {
      console.warn('Cannot update user: no user is currently logged in');
      return;
    }

    const updatedUser = { ...this.currentUser, ...user } as User;
    this.currentUserSubject.next(updatedUser);
    // Use setItem$ which returns an Observable and handle subscription
    this.storage.setItem$(USER_STORAGE_KEY, updatedUser).subscribe({
      error: (error) => console.error('Error saving user to storage:', error),
    });
  }

  /**
   * Clear the current user (on logout)
   */
  clearUser(): void {
    this.currentUserSubject.next(null);
    // Use removeItem$ which returns an Observable and handle subscription
    this.storage.removeItem$(USER_STORAGE_KEY).subscribe({
      error: (error) => console.error('Error removing user from storage:', error),
    });
  }

  /**
   * Refresh the current user from the server
   */
  refreshUser(): void {
    // This would typically make an API call to get the latest user data
    // For now, we'll just reload from storage
    this.loadUserFromStorage();
  }

  // Private methods

  /**
   * Set up authentication state subscription
   */
  private setupAuthState(): void {
    // Initial check
    this.checkAuthState();

    // Set up polling for auth state changes
    const POLLING_INTERVAL = 30000; // 30 seconds

    // Use timer to create a polling interval
    timer(0, POLLING_INTERVAL)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.checkAuthState(),
        error: (error: any) => {
          console.error('Error in auth state polling:', error);
          this.clearUser();
        },
      });
  }

  /**
   * Check the current authentication state and update the user accordingly
   */
  private async checkAuthState(): Promise<void> {
    try {
      const isAuthenticated = await this.authState.isAuthenticated();
      if (!isAuthenticated) {
        this.clearUser();
      } else if (!this.currentUser) {
        // If authenticated but no user data, try to load from storage
        this.loadUserFromStorage();
      }
    } catch (error) {
      console.error('Error checking authentication state:', error);
      this.clearUser();
    }
  }

  /**
   * Load the current user from storage
   */
  private loadUserFromStorage(): void {
    this.storage
      .getItem$<User>(USER_STORAGE_KEY)
      .pipe(
        filter((user: User | null): user is User => user !== null),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (user: User) => {
          if (user) {
            this.currentUserSubject.next(user);
          }
        },
        error: (error: any) => {
          console.error('Failed to load user from storage:', error);
          this.clearUser();
        },
      });
  }
}
