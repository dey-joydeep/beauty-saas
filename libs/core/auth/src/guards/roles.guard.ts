import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { AppUserRole } from '@shared/types/user.types';

export const ROLES_KEY = 'roles';

/**
 * Role hierarchy definition
 * Each role inherits permissions from roles to its right
 */
const ROLE_HIERARCHY: Record<AppUserRole, AppUserRole[]> = {
  [AppUserRole.ADMIN]: [
    AppUserRole.OWNER,
    AppUserRole.STAFF,
    AppUserRole.CUSTOMER
  ],
  [AppUserRole.OWNER]: [
    AppUserRole.STAFF,
    AppUserRole.CUSTOMER
  ],
  [AppUserRole.STAFF]: [
    AppUserRole.CUSTOMER
  ],
  [AppUserRole.CUSTOMER]: []
};

/**
 * Custom decorator to set required roles for a route handler or controller
 * @param roles Array of AppUserRole that are allowed to access the route
 */
export const Roles = (...roles: AppUserRole[]) => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      // Method decorator
      Reflect.defineMetadata(ROLES_KEY, roles, descriptor.value);
      return descriptor;
    }
    // Class decorator
    Reflect.defineMetadata(ROLES_KEY, roles, target);
    return target;
  };
};

@Injectable()
export class RolesGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Checks if a user has at least one of the required roles
   * @param userRoles - Array of user's roles
   * @param requiredRoles - Array of required roles
   */
  private hasRequiredRole(userRoles: AppUserRole[], requiredRoles: AppUserRole[]): boolean {
    return userRoles.some(userRole => {
      // Check direct match
      if (requiredRoles.includes(userRole)) {
        return true;
      }
      
      // Check role hierarchy
      return requiredRoles.some(requiredRole => 
        ROLE_HIERARCHY[userRole]?.includes(requiredRole)
      );
    });
  }

  override canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Get required roles from the handler or the class
    const requiredRoles = this.reflector.getAllAndOverride<AppUserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get the user from the request
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Check if user has a valid role
    if (!user || !user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
      throw new ForbiddenException('User does not have any valid roles');
    }

    // Extract role names from user roles
    const userRoleNames = user.roles
      .map(role => role?.name)
      .filter((role): role is AppUserRole => 
        role !== undefined && Object.values(AppUserRole).includes(role as AppUserRole)
      );

    // Check if user has any of the required roles
    if (userRoleNames.length === 0 || !this.hasRequiredRole(userRoleNames, requiredRoles)) {
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}
