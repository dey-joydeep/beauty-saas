import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';
import { AppUserRole } from '@beauty-saas/shared';

/**
 * Role hierarchy definition - defines which roles can assign which other roles
 * Key: The role that has permission
 * Value: Array of roles that can be assigned by the key role
 */
const ROLE_ASSIGNMENT_PERMISSIONS: Record<AppUserRole, AppUserRole[]> = {
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

@ValidatorConstraint({ name: 'hasPermissionToAssignRole', async: false })
export class HasPermissionToAssignRoleConstraint implements ValidatorConstraintInterface {
  validate(roleToAssign: AppUserRole, args: ValidationArguments) {
    // Get the current user's roles from the request object
    const request = (args.object as { request?: { user?: { roles?: Array<{ name: AppUserRole }> } } }).request;
    if (!request?.user?.roles || !Array.isArray(request.user.roles)) {
      return false;
    }

    const userRoles = request.user.roles
      .map(role => role?.name)
      .filter((role): role is AppUserRole => 
        role !== undefined && Object.values(AppUserRole).includes(role as AppUserRole)
      );
    
    // Check if user has permission to assign the specified role
    return userRoles.some((userRole: AppUserRole) => {
      const allowedRoles = ROLE_ASSIGNMENT_PERMISSIONS[userRole] || [];
      return allowedRoles.includes(roleToAssign);
    });
  }

  defaultMessage(args: ValidationArguments) {
    return `You don't have permission to assign the role: ${args.value}`;
  }
}

/**
 * Custom decorator to validate if the current user has permission to assign the specified role
 */
export function HasPermissionToAssignRole(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: HasPermissionToAssignRoleConstraint,
    });
  };
}
