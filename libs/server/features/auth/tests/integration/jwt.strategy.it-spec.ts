import { Test } from '@nestjs/testing';
import { JwtStrategy } from '../../src/lib/strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy jwtFromRequest branches', () => {
  it('extracts from cookie and falls back to Authorization header', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [JwtStrategy, { provide: ConfigService, useValue: { get: () => 'AS' } }],
    }).compile();
    const strat = moduleRef.get(JwtStrategy);
    type Req = { cookies?: { bsaas_at?: string }; headers?: { authorization?: string } };
    const extract = (strat as unknown as { _jwtFromRequest: (req: Req) => string | undefined })._jwtFromRequest;

    // Cookie wins
    const req1: Req = { cookies: { bsaas_at: 'cookieToken' }, headers: { authorization: 'Bearer headerToken' } };
    const fromCookie = extract(req1);
    expect(fromCookie).toBe('cookieToken');

    // Fallback to Authorization header
    const req2: Req = { headers: { authorization: 'Bearer headerToken' } };
    const fromHeader = extract(req2);
    expect(fromHeader).toBe('headerToken');
  });
});
