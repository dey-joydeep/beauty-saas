import { ConfigService } from '@nestjs/config';

/**
 * Resolve the access token signing secret from configuration with sensible fallbacks for tests.
 *
 * Order: JWT_ACCESS_SECRET -> JWT_SECRET -> 'test-access-secret'
 *
 * @param {ConfigService} config - Nest config service.
 * @returns {string} Secret to use for access tokens.
 */
export function resolveAccessSecret(config: ConfigService): string {
  return (
    config.get<string>('JWT_ACCESS_SECRET') ||
    config.get<string>('JWT_SECRET') ||
    'test-access-secret'
  );
}

/**
 * Resolve the refresh token signing secret from configuration with sensible fallbacks for tests.
 *
 * Order: JWT_REFRESH_SECRET -> JWT_SECRET -> 'test-refresh-secret'
 *
 * @param {ConfigService} config - Nest config service.
 * @returns {string} Secret to use for refresh tokens.
 */
export function resolveRefreshSecret(config: ConfigService): string {
  return (
    config.get<string>('JWT_REFRESH_SECRET') ||
    config.get<string>('JWT_SECRET') ||
    'test-refresh-secret'
  );
}

