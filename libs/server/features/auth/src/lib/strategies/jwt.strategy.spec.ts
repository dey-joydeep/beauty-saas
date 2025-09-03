import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  it('validate maps payload to user context', () => {
    const cfg = { get: jest.fn().mockReturnValue('secret') } as unknown as ConfigService;
    const strat = new JwtStrategy(cfg);
    const result = strat.validate({
      sub: 'uid-1',
      email: 'e@example.com',
      roles: ['customer'],
      sessionId: 'sess-1',
      iat: 1,
      exp: 2,
    });
    expect(result).toEqual({ userId: 'uid-1', email: 'e@example.com', roles: ['customer'], sessionId: 'sess-1' });
  });

  it('extracts token from bsaas_at cookie first', () => {
    const cfg = { get: jest.fn().mockReturnValue('secret') } as unknown as ConfigService;
    const strat: any = new JwtStrategy(cfg);
    const req = { cookies: { bsaas_at: 'cookie-token' }, headers: { authorization: 'Bearer header-token' } };
    const tok = strat._jwtFromRequest(req);
    expect(tok).toBe('cookie-token');
  });

  it('falls back to Authorization header when cookie missing', () => {
    const cfg = { get: jest.fn().mockReturnValue('secret') } as unknown as ConfigService;
    const strat: any = new JwtStrategy(cfg);
    const req = { cookies: {}, headers: { authorization: 'Bearer header-token' } };
    const tok = strat._jwtFromRequest(req);
    expect(tok).toBe('header-token');
  });
});
