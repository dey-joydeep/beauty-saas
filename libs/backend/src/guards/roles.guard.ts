import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserRole } from '@prisma/client';

// Define a type that represents both string and object role formats
type UserRoleInfo = string | { name: string; [key: string]: any };

// Define the AuthenticatedUser interface
export interface AuthenticatedUser {
  id: string;
  roles: string[] | UserRoleInfo[];
  [key: string]: any;
}

export const ROLES_KEY = 'roles';

type Constructor = new (...args: any[]) => any;
type MethodDecoratorReturn = (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => void;

export function Roles(...roles: string[]): MethodDecorator & ClassDecorator {
  return function (target: any, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) {
    if (descriptor) {
      // Method decorator
      Reflect.defineMetadata(ROLES_KEY, roles, target, key as string | symbol);
      return descriptor;
    } else if (typeof target === 'function') {
      // Class decorator
      Reflect.defineMetadata(ROLES_KEY, roles, target);
      return target;
    } else {
      // Property decorator (not supported, but handle gracefully)
      Reflect.defineMetadata(ROLES_KEY, roles, target.constructor, key as string | symbol);
      return target;
    }
  } as MethodDecorator & ClassDecorator;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user || !user.roles) {
      throw new ForbiddenException('User not authenticated or missing roles');
    }

    const hasRequiredRole = requiredRoles.some((requiredRole: string) => {
      if (!user.roles || !Array.isArray(user.roles)) return false;
      
      return user.roles.some((role: unknown) => {
        // Handle different role formats
        if (typeof role === 'string') {
          return role.toUpperCase() === requiredRole.toUpperCase();
        }
        
        if (role && typeof role === 'object') {
          // Handle Prisma's UserRole enum
          if ('name' in role) {
            return String((role as { name: unknown }).name).toUpperCase() === requiredRole.toUpperCase();
          }
          // Handle role objects with different property names
          if ('role' in role) {
            return String((role as { role: unknown }).role).toUpperCase() === requiredRole.toUpperCase();
          }
        }
        
        return false;
      });
    });

    if (!hasRequiredRole) {
      throw new ForbiddenException({
        code: 'error.insufficient_permissions',
        message: `User does not have required role. Required: ${requiredRoles.join(', ')}`,
      });
    }

    return true;
  }
}
