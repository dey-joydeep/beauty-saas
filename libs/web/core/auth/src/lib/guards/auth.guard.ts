import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { CURRENT_USER, CurrentUserPort } from '../interfaces/current-user.port';

/**
 * Auth guard that checks if user is authenticated
 * Redirects to login page if not authenticated
 */
export const authGuard: CanActivateFn = (route, state) => {
  const currentUserService = inject(CURRENT_USER) as CurrentUserPort;
  const router = inject(Router);

  return currentUserService.currentUser$.pipe(
    take(1),
    map((user) => {
      if (user) {
        return true;
      }

      // Store the attempted URL for redirecting after login
      currentUserService.redirectUrl = state.url;

      // Navigate to login page
      return router.createUrlTree(['/auth/login']);
    }),
  );
};

/**
 * Public guard that checks if user is not authenticated
 * Redirects to home if already authenticated
 */
export const publicGuard: CanActivateFn = (route, state) => {
  const currentUserService = inject(CURRENT_USER) as CurrentUserPort;
  const router = inject(Router);

  return currentUserService.currentUser$.pipe(
    take(1),
    map((user) => {
      if (!user) {
        return true;
      }

      // User is already logged in, redirect to home
      return router.createUrlTree(['/']);
    }),
  );
};
