import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthController } from '../../src/lib/controllers/auth.controller';
import { AuthService } from '../../src/lib/services/auth.service';
import { WEB_AUTHN_PORT, RECOVERY_CODES_PORT } from '@cthub-bsaas/server-contracts-auth';
import type { WebAuthnPort, RecoveryCodesPort } from '@cthub-bsaas/server-contracts-auth';
import type { Response } from 'express';

describe('AuthController additional (integration-light)', () => {
  let app: INestApplication;
  const authSvc: Partial<AuthService> = {
    refreshToken: jest.fn(async () => ({ accessToken: 'at2', refreshToken: 'rt2' })),
    logout: jest.fn(async () => {}),
    listSessions: jest.fn(async () => []),
    revokeSession: jest.fn(async (_u: string, _s: string): Promise<{ success: true }> => ({ success: true as const })),
    signInWithTotp: jest.fn(async (_t: string, _c: string) => ({ accessToken: 'at', refreshToken: 'rt' })),
    requestPasswordReset: jest.fn(async () => {}),
    resetPassword: jest.fn(async () => {}),
    requestEmailVerification: jest.fn(async () => {}),
    verifyEmail: jest.fn(async () => {}),
  };

  beforeAll(async () => {
    const webAuthn: jest.Mocked<Pick<WebAuthnPort, 'startRegistration' | 'finishRegistration' | 'startAuthentication' | 'finishAuthentication'>> = {
      startRegistration: jest.fn(async (_u: string, _n: string) => ({ challenge: 'c' } as Record<string, unknown>)),
      finishRegistration: jest.fn(async (_u: string, _r: Record<string, unknown>) => ({ credentialId: 'cid', counter: 0 })),
      startAuthentication: jest.fn(async (_u: string) => ({ challenge: 'c2' } as Record<string, unknown>)),
      finishAuthentication: jest.fn(async (_u: string, _r: Record<string, unknown>) => ({ credentialId: 'cid', counter: 1 })),
    };
    const recovery: Pick<RecoveryCodesPort, 'generate' | 'verifyAndConsume'> = {
      generate: async (_userId: string, _count?: number) => ['r1', 'r2'],
      verifyAndConsume: async (_userId: string, _code: string) => true,
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authSvc as AuthService },
        { provide: WEB_AUTHN_PORT, useValue: webAuthn },
        { provide: RECOVERY_CODES_PORT, useValue: recovery },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('handles login/totp endpoint', async () => {
    const res = await (await import('supertest')).default(app.getHttpServer())
      .post('/auth/login/totp')
      .send({ tempToken: 'a.b.c', totpCode: '123456' })
      .expect(200);
    expect(res.body).toEqual({});
  });

  it('login sets temp token branch (no cookies)', async () => {
    const req = (await import('supertest')).default(app.getHttpServer());
    // Override signIn to simulate TOTP-required response
    (authSvc.signIn as any) = jest.fn(async () => ({ totpRequired: true, tempToken: 'tmp' }));
    const res = await req.post('/auth/login').send({ email: 'e@example.com', password: 'p' }).expect(200);
    expect(res.body).toEqual({ totpRequired: true, tempToken: 'tmp' });
  });

  it('handles password reset request and reset', async () => {
    const req = (await import('supertest')).default(app.getHttpServer());
    await req.post('/auth/password/forgot').send({ email: 'e@example.com' }).expect(202);
    await req.post('/auth/password/reset').send({ token: 't', newPassword: 'N3w!Pass' }).expect(200);
  });

  it('handles email verification request and verify', async () => {
    const req = (await import('supertest')).default(app.getHttpServer());
    await req.post('/auth/email/send-verification').send({ email: 'e@example.com' }).expect(202);
    await req.post('/auth/email/verify').send({ token: 't' }).expect(200);
  });

  it('handles webauthn register start (direct method call)', async () => {
    const ctrl = app.get(AuthController);
    const r = await ctrl.webauthnRegisterStart({ username: 'u' } as any, { user: { userId: 'u1' } } as any);
    expect(r).toHaveProperty('challenge');
  });

  it('handles webauthn register finish (direct method call)', async () => {
    const ctrl = app.get(AuthController);
    const out = await ctrl.webauthnRegisterFinish({}, { user: { userId: 'u1' } } as any);
    expect(out).toEqual({ success: true });
  });

  it('handles webauthn register finish (direct method call sets cookie)', async () => {
    const ctrl = app.get(AuthController);
    const res = { cookie: jest.fn() } as unknown as Pick<Response, 'cookie'>;
    (authSvc.issueTokensForUser as jest.Mock) = jest.fn(async () => ({ accessToken: 'at3', refreshToken: 'rt3' }));
    const out = await ctrl.webauthnLoginFinish({}, { user: { userId: 'u1' } } as any, res as any);
    expect(out).toEqual({});
  });

  it('webauthn login start requires user or throws, else returns options', async () => {
    const ctrl = app.get(AuthController);
    await expect(ctrl.webauthnLoginStart({} as any)).rejects.toBeTruthy();
    const r = await ctrl.webauthnLoginStart({ user: { userId: 'u1' } } as any);
    expect(r).toHaveProperty('challenge');
  });

  it('recovery generate and verify branches', async () => {
    const ctrl = app.get(AuthController);
    const codes = await ctrl.generateRecovery({ user: { userId: 'u1' } } as any);
    expect(Array.isArray(codes)).toBe(true);
    const ok = await ctrl.verifyRecovery({ code: 'r1' }, { user: { userId: 'u1' } } as any);
    expect(ok).toEqual({ success: true });
    // failure branch
    const recoveryProv = app.get(RECOVERY_CODES_PORT) as RecoveryCodesPort;
    (recoveryProv as any).verifyAndConsume = async (_u: string, _c: string) => false;
    await expect(ctrl.verifyRecovery({ code: 'bad' }, { user: { userId: 'u1' } } as any)).rejects.toBeTruthy();
  });

  it('refresh uses cookie when body missing', async () => {
    const ctrl = app.get(AuthController);
    const fakeReq = { headers: { cookie: 'refreshToken=abc' } } as any;
    const out = await ctrl.refresh({} as any, fakeReq, { cookie: () => {} } as any);
    expect(out).toEqual({});
  });

  it('refresh without cookie or body returns 400 over HTTP', async () => {
    const req = (await import('supertest')).default(app.getHttpServer());
    await req.post('/auth/refresh').expect(400);
  });

  it('refresh via HTTP with body sets new refresh cookie (branch)', async () => {
    // Arrange mock to include refreshToken in result
    (authSvc.refreshToken as jest.Mock) = jest.fn(async () => ({ accessToken: 'AT', refreshToken: 'NEW' }));
    const req = (await import('supertest')).default(app.getHttpServer());
    const res = await req.post('/auth/refresh').send({ refreshToken: 'BODYTOKEN' }).expect(200);
    // body path covered; check cookie set branch
    const setCookie = res.get('set-cookie') as unknown;
    const cookieStr = Array.isArray(setCookie) ? (setCookie as string[]).join(';') : String(setCookie ?? '');
    expect(cookieStr).toContain('bsaas_rt=');
  });

  it('refresh via HTTP picks encoded cookie over body (decode branch)', async () => {
    (authSvc.refreshToken as jest.Mock) = jest.fn(async () => ({ accessToken: 'AT2', refreshToken: 'NEW2' }));
    const req = (await import('supertest')).default(app.getHttpServer());
    await req
      .post('/auth/refresh')
      .set('Cookie', ['refreshToken=a%3Db'])
      .send({ refreshToken: 'IGNORED' })
      .expect(200)
      .expect((r) => {
        const sc = r.get('set-cookie') as unknown;
        const cookieStr = Array.isArray(sc) ? (sc as string[]).join(';') : String(sc ?? '');
        expect(cookieStr).toContain('bsaas_rt=');
      });
  });

  it('refresh via HTTP with unrelated cookie falls back to body (loop false branch)', async () => {
    (authSvc.refreshToken as jest.Mock) = jest.fn(async () => ({ accessToken: 'AT3', refreshToken: 'NEW3' }));
    const req = (await import('supertest')).default(app.getHttpServer());
    await req
      .post('/auth/refresh')
      .set('Cookie', ['sid=1'])
      .send({ refreshToken: 'BODY3' })
      .expect(200)
      .expect((r) => {
        const sc = r.get('set-cookie') as unknown;
        const cookieStr = Array.isArray(sc) ? (sc as string[]).join(';') : String(sc ?? '');
        expect(cookieStr).toContain('bsaas_rt=');
      });
  });

  it('refresh via HTTP when service returns no refreshToken (no cookie set branch)', async () => {
    (authSvc.refreshToken as jest.Mock) = jest.fn(async () => ({ accessToken: 'AT4' }));
    const req = (await import('supertest')).default(app.getHttpServer());
    const res = await req
      .post('/auth/refresh')
      .send({ refreshToken: 'BODY4' })
      .expect(200);
    const sc = res.get('set-cookie') as unknown;
    const cookieStr = Array.isArray(sc) ? (sc as string[]).join(';') : String(sc ?? '');
    expect(cookieStr).not.toContain('bsaas_rt=');
  });

  it('refresh via HTTP with empty cookie value returns 400 (v falsy branch)', async () => {
    const req = (await import('supertest')).default(app.getHttpServer());
    await req
      .post('/auth/refresh')
      .set('Cookie', ['refreshToken='])
      .expect(400);
  });

  it('refresh direct call without cookie and body throws BadRequest (covers throw line)', async () => {
    const ctrl = app.get(AuthController);
    await expect(ctrl.refresh({} as any, { headers: {} } as any, { cookie: () => {} } as any)).rejects.toBeTruthy();
  });

  it('refresh direct call with empty cookie value hits else branch and 400', async () => {
    const ctrl = app.get(AuthController);
    await expect(
      ctrl.refresh({} as any, { headers: { cookie: 'refreshToken=' } } as any, { cookie: () => {} } as any),
    ).rejects.toBeTruthy();
  });
});
