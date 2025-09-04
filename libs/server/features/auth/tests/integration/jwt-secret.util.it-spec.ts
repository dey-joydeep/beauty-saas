import { resolveAccessSecret, resolveRefreshSecret } from '../../src/lib/utils/jwt-secret.util';
import type { ConfigService } from '@nestjs/config';

describe('jwt-secret.util (integration coverage)', () => {
  it('covers access and refresh secret resolution branches', () => {
    const cfg: Pick<ConfigService, 'get'> = { get: (k: string) => ({ JWT_ACCESS_SECRET: 'A', JWT_REFRESH_SECRET: 'R', JWT_SECRET: 'S' } as Record<string, string>)[k] };
    expect(resolveAccessSecret(cfg)).toBe('A');
    const cfg2: Pick<ConfigService, 'get'> = { get: (k: string) => ({ JWT_SECRET: 'S' } as Record<string, string>)[k] };
    expect(resolveAccessSecret(cfg2)).toBe('S');
    const cfg3: Pick<ConfigService, 'get'> = { get: (k: string) => { void k; return undefined; } };
    expect(resolveAccessSecret(cfg3)).toBe('test-access-secret');

    expect(resolveRefreshSecret(cfg)).toBe('R');
    expect(resolveRefreshSecret(cfg2)).toBe('S');
    expect(resolveRefreshSecret(cfg3)).toBe('test-refresh-secret');
  });
});
