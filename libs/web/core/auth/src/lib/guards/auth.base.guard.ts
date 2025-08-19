import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { CURRENT_USER, CurrentUserPort } from '../interfaces/current-user.port';

/**
 * Base authentication guard that checks if a user is authenticated.
 * Can be used as a base class for more specific guards.
 */
export const authBaseGuard: CanActivateFn = (route, state) => {
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
