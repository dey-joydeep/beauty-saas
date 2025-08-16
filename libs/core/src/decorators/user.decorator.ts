import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '@beauty-saas/shared/types/user.types';

export type AuthUser = AuthenticatedUser;

export const User = createParamDecorator(
    (_: unknown, ctx: ExecutionContext): AuthenticatedUser => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
