import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ThrottlerException } from '@nestjs/throttler';

/**
 * Adds a Retry-After header and a stable error code for rate-limited responses (429).
 * Falls back to a default TTL of 60s when config is unavailable.
 */
@Catch(ThrottlerException)
export class ThrottlerRetryAfterFilter implements ExceptionFilter<ThrottlerException> {
  constructor() {}

  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const ttl = 60; // default seconds; align with route-level Throttle where possible
    res.setHeader('Retry-After', String(ttl));
    res.status(HttpStatus.TOO_MANY_REQUESTS).json({ code: 'error.rate_limited' });
  }
}
