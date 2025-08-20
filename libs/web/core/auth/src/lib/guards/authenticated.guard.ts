import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { CURRENT_USER, CurrentUserPort } from '../interfaces/current-user.port';

/**
 * Authenticated guard: allows only authenticated users.
 * Stores attempted URL and redirects unauthenticated users to login.
 */
export const authenticatedGuard: CanActivateFn = (route, state) => {
  const currentUserService = inject(CURRENT_USER) as CurrentUserPort;
  const router = inject(Router);

  return currentUserService.isAuthenticated$.pipe(
    take(1),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true;
      }

      // Store the attempted URL for redirecting after login
      currentUserService.redirectUrl = state.url;

      // Navigate to the login page
      return router.createUrlTree(['/auth/login']);
    }),
  );
};
