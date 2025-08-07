import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';
import { PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { AppUserRole } from '@shared/types/user.types';

@ValidatorConstraint({ name: 'isNotLastAdmin', async: true })
@Injectable()
export class IsNotLastAdminConstraint implements ValidatorConstraintInterface {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async validate(userId: string, args: ValidationArguments) {
        // Get the DTO instance and the role being set (if any)
        const dto = args.object as any;
        const roleToSet = dto.role as AppUserRole | undefined;

        // If not setting a role or not demoting from admin, allow
        if (!roleToSet || roleToSet === AppUserRole.ADMIN) {
            return true;
        }

        // Get the current user's tenant ID
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { tenant: true }
        });

        if (!user || !user.tenantId) {
            return true; // Not part of a tenant, can't be a tenant admin
        }

        // First, find the role ID for ADMIN
        const adminRole = await this.prisma.role.findUnique({
            where: { name: AppUserRole.ADMIN }
        });

        if (!adminRole) {
            return true; // No admin role found, can't be the last admin
        }

        // Check if the user is currently an admin in this tenant
        const userRole = await this.prisma.userRole.findFirst({
            where: {
                userId: userId,
                roleId: adminRole.id,
                user: {
                    tenantId: user.tenantId
                }
            }
        });

        if (!userRole) {
            return true; // Not currently an admin, so not the last admin
        }

        // Count how many other admins exist in this tenant
        const adminCount = await this.prisma.userRole.count({
            where: {
                roleId: adminRole.id,
                user: {
                    id: { not: userId },
                    isActive: true,
                    tenantId: user.tenantId
                }
            }
        });

        // If there are other active admins, allow the change
        return adminCount > 0;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Cannot remove or demote the last admin of a tenant. Please assign another admin first.';
    }
}

/**
 * Custom decorator to validate that the user is not the last admin in their tenant
 * when attempting to be removed or demoted
 */
export function IsNotLastAdmin(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsNotLastAdminConstraint,
        });
    };
}
