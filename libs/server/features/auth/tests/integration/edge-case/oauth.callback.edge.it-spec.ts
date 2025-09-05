import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthController } from '../../../src/lib/controllers/auth.controller';
import { AuthService } from '../../../src/lib/services/auth.service';
import { OAUTH_PORT, OAuthPort, SOCIAL_ACCOUNT_REPOSITORY, ISocialAccountRepository, WEB_AUTHN_PORT, RECOVERY_CODES_PORT } from '@cthub-bsaas/server-contracts-auth';
import { ConfigService } from '@nestjs/config';

describe('OAuth callback (edge-case)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const svc: Pick<AuthService, 'signInWithSocial' | 'linkSocialAccount'> = {
      signInWithSocial: (async () => ({ accessToken: 'AT', refreshToken: 'RT' })) as unknown as AuthService['signInWithSocial'],
      linkSocialAccount: (async () => {}) as unknown as AuthService['linkSocialAccount'],
    };
    const modRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: svc },
        { provide: ConfigService, useValue: { get: () => undefined } },
        { provide: OAUTH_PORT, useValue: { exchangeCode: async () => ({ provider: 'google', providerUserId: 'p1', email: 'e@example.com', emailVerified: true }) } as Pick<OAuthPort, 'exchangeCode'> },
        { provide: WEB_AUTHN_PORT, useValue: {} },
        { provide: RECOVERY_CODES_PORT, useValue: {} },
        { provide: SOCIAL_ACCOUNT_REPOSITORY, useValue: {} as ISocialAccountRepository },
      ],
    }).compile();
    app = modRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('sets cookies after callback login', async () => {
    const req = (await import('supertest')).default(app.getHttpServer());
    const res = await req.get('/auth/oauth/google/callback').query({ code: 'c' }).expect(200);
    const setCookie = res.get('set-cookie') as unknown;
    const cookieStr = Array.isArray(setCookie) ? (setCookie as string[]).join(';') : String(setCookie ?? '');
    expect(cookieStr).toContain('bsaas_at=');
    expect(cookieStr).toContain('bsaas_rt=');
  });

  it('links account when authenticated user present', async () => {
    // Direct controller call to simulate req.user
    const mod = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: { linkSocialAccount: async () => {} } },
        { provide: ConfigService, useValue: { get: () => undefined } },
        { provide: OAUTH_PORT, useValue: { exchangeCode: async () => ({ provider: 'google', providerUserId: 'p1' }) } as Pick<OAuthPort, 'exchangeCode'> },
        { provide: SOCIAL_ACCOUNT_REPOSITORY, useValue: {} as ISocialAccountRepository },
        { provide: WEB_AUTHN_PORT, useValue: {} },
        { provide: RECOVERY_CODES_PORT, useValue: {} },
      ],
    }).compile();
    const app2 = mod.createNestApplication();
    await app2.init();
    const ctrl = app2.get(AuthController);
    const result = await ctrl.oauthCallback('google', { user: { userId: 'u1' } }, {} as unknown as import('express').Response, 'c');
    expect(result).toEqual({});
    await app2.close();
  });

  it('returns 400 when code is missing', async () => {
    const req = (await import('supertest')).default(app.getHttpServer());
    await req.get('/auth/oauth/google/callback').expect(400);
  });
});
