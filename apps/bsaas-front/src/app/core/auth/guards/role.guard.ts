import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { CurrentUserService } from '../services/current-user.service';

/**
 * Role guard that checks if user has required roles
 * Redirects to unauthorized page if user doesn't have required roles
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const currentUserService = inject(CurrentUserService);
  const router = inject(Router);

  return currentUserService.currentUser$.pipe(
    take(1),
    map((user) => {
      // If no user is logged in, redirect to login
      if (!user) {
        currentUserService.redirectUrl = state.url;
        return router.createUrlTree(['/auth/login']);
      }

      // Get required roles from route data
      const requiredRoles = route.data?.['roles'] as string[];

      // If no roles are required, allow access
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }

      // Check if user has any of the required roles
      const hasRequiredRole = requiredRoles.includes(user.role);

      if (hasRequiredRole) {
        return true;
      }

      // User doesn't have required role, redirect to unauthorized
      return router.createUrlTree(['/unauthorized']);
    })
  );
};
