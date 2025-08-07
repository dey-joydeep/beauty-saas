import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface JwtUserPayload {
  sub: string;  // Subject (user ID)
  email: string;
  iat?: number; // Issued at
  exp?: number; // Expiration time
  name?: string;
  tenantId?: string;
  roles?: string[] | Array<{ id: number; name: string }>;
  role?: string; // For backward compatibility
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  tenantId: string;
  roles: Array<{ id: number; name: string }>;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService) {
    super();
  }

  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException({
        code: 'error.unauthorized',
        message: 'No authentication token provided',
      });
    }

    try {
      const payload = this.jwtService.verify<JwtUserPayload>(token);
      
      // Normalize roles to array of { id, name } objects
      const normalizedRoles = (payload.roles || []).map((role, index) => {
        if (typeof role === 'string') {
          return { id: index, name: role };
        }
        return role;
      });
      
      // If no roles but has role (for backward compatibility)
      if (normalizedRoles.length === 0 && payload.role) {
        normalizedRoles.push({ id: 0, name: payload.role });
      }
      
      // Attach user to request
      request.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name || '',
        isVerified: true,
        tenantId: payload.tenantId || 'default-tenant',
        roles: normalizedRoles,
      };

      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedException({
            code: 'error.token_expired',
            message: 'Token expired',
          });
        }
        if (error.name === 'JsonWebTokenError') {
          throw new UnauthorizedException({
            code: 'error.invalid_token',
            message: 'Invalid token',
          });
        }
        console.error('Authentication error:', error);
      }
      
      throw new UnauthorizedException({
        code: 'error.authentication_failed',
        message: 'Authentication failed',
      });
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : request.cookies?.token;
  }
}
