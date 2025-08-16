import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '@beauty-saas/shared';

/**
 * @deprecated Use AuthenticatedUser from @beauty-saas/shared instead
 */
export type AuthUser = AuthenticatedUser;

/**
 * Parameter decorator to get the authenticated user from the request
 */
export const User = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
        const request = ctx.switchToHttp().getRequest();
        return request.user as AuthenticatedUser;
    },
);
