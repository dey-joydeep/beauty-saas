import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CookieRegistry, buildSetCookie } from './cookie-commands';

/**
 * @public
 * Interceptor that applies queued cookie commands to the underlying response
 * using the current HTTP adapter (Express or Fastify).
 */
@Injectable()
export class CookiesInterceptor implements NestInterceptor {
  constructor(private readonly registry: CookieRegistry, private readonly httpAdapterHost: HttpAdapterHost) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      tap(() => {
        const http = context.switchToHttp();
        const res = http.getResponse();
        const adapter = this.httpAdapterHost.httpAdapter;
        const commands = this.registry.drain();
        if (!commands.length) return;

        const headerValues = commands.map(buildSetCookie);
        // Use adapter to set the Set-Cookie header; adapters accept string|string[]
        adapter.setHeader(res, 'Set-Cookie', headerValues);
      }),
    );
  }
}

