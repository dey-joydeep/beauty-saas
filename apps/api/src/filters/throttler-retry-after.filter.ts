import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ThrottlerException } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

/**
 * Adds a Retry-After header and a stable error code for rate-limited responses (429).
 * Falls back to a default TTL of 60s when config is unavailable.
 */
@Catch(ThrottlerException)
export class ThrottlerRetryAfterFilter implements ExceptionFilter<ThrottlerException> {
  constructor(private readonly reflector: Reflector) {}

  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    // Try to read route-level TTL metadata; fall back to 60s
    const handler = ctx.getHandler?.();
    const klass = ctx.getClass?.();
    const metaKey = 'THROTTLER_TTL'; // token used by @nestjs/throttler
    const ttl =
      (handler && this.reflector.get<number>(metaKey, handler)) ||
      (klass && this.reflector.get<number>(metaKey, klass)) ||
      60;
    res.setHeader('Retry-After', String(ttl));
    res.status(HttpStatus.TOO_MANY_REQUESTS).json({ code: 'error.rate_limited' });
  }
}
