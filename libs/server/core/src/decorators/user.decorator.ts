import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '@beauty-saas/shared';

/**
 * @deprecated Use AuthenticatedUser from @beauty-saas/shared instead
 */
export type AuthUser = AuthenticatedUser;

/**
 * Parameter decorator to get the authenticated user from the request
 */
export const User = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
  const request = ctx.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
  return request.user;
});
