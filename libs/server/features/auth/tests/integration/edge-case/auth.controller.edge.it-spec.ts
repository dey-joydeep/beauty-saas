import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthController } from '../../../src/lib/controllers/auth.controller';
import { AuthService } from '../../../src/lib/services/auth.service';
import { WEB_AUTHN_PORT, RECOVERY_CODES_PORT } from '@cthub-bsaas/server-contracts-auth';
import type { WebAuthnPort, RecoveryCodesPort } from '@cthub-bsaas/server-contracts-auth';
import type { Response } from 'express';

describe('AuthController additional (integration-light)', () => {
  let app: INestApplication;
  type AuthSvcMock = jest.Mocked<
    Pick<
      AuthService,
      | 'refreshToken'
      | 'logout'
      | 'listSessions'
      | 'revokeSession'
      | 'signInWithTotp'
      | 'requestPasswordReset'
      | 'resetPassword'
      | 'requestEmailVerification'
      | 'verifyEmail'
      | 'signIn'
      | 'verifyEmailOtp'
      | 'issueTokensForUser'
    >
  >;
  const authSvc: AuthSvcMock = {
    refreshToken: (jest.fn(async () => ({ accessToken: 'at2', refreshToken: 'rt2' })) as unknown) as AuthSvcMock['refreshToken'],
    logout: (jest.fn(async () => {}) as unknown) as AuthSvcMock['logout'],
    listSessions: (jest.fn(async () => []) as unknown) as AuthSvcMock['listSessions'],
    revokeSession: jest.fn(async (u: string, s: string): Promise<{ success: true }> => { void u; void s; return { success: true as const }; }),
    signInWithTotp: (jest.fn(async () => ({ accessToken: 'at', refreshToken: 'rt' })) as unknown) as AuthSvcMock['signInWithTotp'],
    requestPasswordReset: (jest.fn(async () => {}) as unknown) as AuthSvcMock['requestPasswordReset'],
    resetPassword: (jest.fn(async () => {}) as unknown) as AuthSvcMock['resetPassword'],
    requestEmailVerification: (jest.fn(async () => {}) as unknown) as AuthSvcMock['requestEmailVerification'],
    verifyEmail: (jest.fn(async () => {}) as unknown) as AuthSvcMock['verifyEmail'],
    signIn: jest.fn(),
    verifyEmailOtp: (jest.fn(async () => {}) as unknown) as AuthSvcMock['verifyEmailOtp'],
    issueTokensForUser: (jest.fn(async () => ({ accessToken: 'a', refreshToken: 'r' })) as unknown) as AuthSvcMock['issueTokensForUser'],
  };

  beforeAll(async () => {
    const webAuthn: jest.Mocked<Pick<WebAuthnPort, 'startRegistration' | 'finishRegistration' | 'startAuthentication' | 'finishAuthentication'>> = {
      startRegistration: jest.fn(async (u: string, n: string) => {
        void u; void n; return { challenge: 'c' } as Record<string, unknown>;
      }),
      finishRegistration: jest.fn(async (u: string, r: Record<string, unknown>) => {
        void u; void r; return { credentialId: 'cid', counter: 0 };
      }),
      startAuthentication: jest.fn(async (u: string) => { void u; return { challenge: 'c2' } as Record<string, unknown>; }),
      finishAuthentication: jest.fn(async (u: string, r: Record<string, unknown>) => { void u; void r; return { credentialId: 'cid', counter: 1 }; }),
    };
    const recovery: Pick<RecoveryCodesPort, 'generate' | 'verifyAndConsume'> = {
      generate: async (userId: string, count?: number) => { void userId; void count; return ['r1', 'r2']; },
      verifyAndConsume: async (userId: string, code: string) => { void userId; void code; return true; },
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: (await import('@nestjs/config')).ConfigService, useValue: { get: () => undefined } },
        { provide: AuthService, useValue: authSvc },
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
    authSvc.signIn = (jest.fn(async () => ({ totpRequired: true as const, tempToken: 'tmp' })) as unknown) as typeof authSvc.signIn;
    const res = await req.post('/auth/login').send({ email: 'e@example.com', password: 'p' }).expect(200);
    expect(res.body).toEqual({ totpRequired: true, tempToken: 'tmp' });
  });

  it('login success sets cookies (non-TOTP)', async () => {
    const req = (await import('supertest')).default(app.getHttpServer());
    authSvc.signIn = (jest.fn(async () => ({ totpRequired: false as const, accessToken: 'AT', refreshToken: 'RT' })) as unknown) as typeof authSvc.signIn;
    const res = await req.post('/auth/login').send({ email: 'e@example.com', password: 'p' }).expect(200);
    const sc = res.get('set-cookie') as unknown;
    const cookieStr = Array.isArray(sc) ? (sc as string[]).join(';') : String(sc ?? '');
    expect(cookieStr).toContain('bsaas_at=');
    expect(cookieStr).toContain('bsaas_rt=');
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
    type ReqCtx = { user: { userId: string } };
    const r = await ctrl.webauthnRegisterStart({ username: 'u' }, { user: { userId: 'u1' } } as ReqCtx);
    expect(r).toHaveProperty('challenge');
  });

  it('handles webauthn register finish (direct method call)', async () => {
    const ctrl = app.get(AuthController);
    const out = await ctrl.webauthnRegisterFinish({} as Record<string, unknown>, { user: { userId: 'u1' } } as { user: { userId: string } });
    expect(out).toEqual({ success: true });
  });

  it('handles webauthn register finish (direct method call sets cookie)', async () => {
    const ctrl = app.get(AuthController);
    const res: Pick<Response, 'cookie'> = { cookie: jest.fn() as unknown as Response['cookie'] };
    authSvc.issueTokensForUser = (jest.fn(async () => ({ accessToken: 'at3', refreshToken: 'rt3' })) as unknown) as typeof authSvc.issueTokensForUser;
    const out = await ctrl.webauthnLoginFinish({} as Record<string, unknown>, { user: { userId: 'u1' } } as { user: { userId: string } }, res as Response);
    expect(out).toEqual({});
  });

  it('webauthn login start requires user or throws, else returns options', async () => {
    const ctrl = app.get(AuthController);
    await expect(ctrl.webauthnLoginStart({} as { user?: { userId: string } })).rejects.toBeTruthy();
    const r = await ctrl.webauthnLoginStart({ user: { userId: 'u1' } });
    expect(r).toHaveProperty('challenge');
  });

  it('recovery generate and verify branches', async () => {
    const ctrl = app.get(AuthController);
    const codes = await ctrl.generateRecovery({ user: { userId: 'u1' } } as { user: { userId: string } });
    expect(Array.isArray(codes)).toBe(true);
    const ok = await ctrl.verifyRecovery({ code: 'r1' }, { user: { userId: 'u1' } } as { user: { userId: string } });
    expect(ok).toEqual({ success: true });
    // failure branch
    const recoveryProv = app.get(RECOVERY_CODES_PORT) as RecoveryCodesPort & { verifyAndConsume: (u: string, c: string) => Promise<boolean> };
    recoveryProv.verifyAndConsume = async (u: string, c: string) => { void u; void c; return false; };
    await expect(ctrl.verifyRecovery({ code: 'bad' }, { user: { userId: 'u1' } } as { user: { userId: string } })).rejects.toBeTruthy();
  });

  it('logout clears cookies (direct call)', async () => {
    const ctrl = app.get(AuthController);
    const res: Pick<Response, 'clearCookie'> = { clearCookie: jest.fn() as unknown as Response['clearCookie'] };
    authSvc.logout = (jest.fn(async () => {}) as unknown) as typeof authSvc.logout;
    const out = await ctrl.logout({ user: { sessionId: 's1' } } as { user: { sessionId: string } }, res as Response);
    expect(out).toEqual({ success: true });
    const clear = res.clearCookie as unknown as jest.Mock;
    expect(clear.mock.calls.some((c: unknown[]) => (c as unknown[])[0] === 'bsaas_rt')).toBe(true);
    expect(clear.mock.calls.some((c: unknown[]) => (c as unknown[])[0] === 'bsaas_at')).toBe(true);
  });

  it('email verify confirm branches (token and bad body)', async () => {
    const ctrl = app.get(AuthController);
    authSvc.verifyEmail = (jest.fn(async () => {}) as unknown) as typeof authSvc.verifyEmail;
    await expect(ctrl.emailVerifyConfirm({ token: 'T' } as { token: string })).resolves.toEqual({ success: true });
    await expect(ctrl.emailVerifyConfirm({} as { token?: string; email?: string; otp?: string })).rejects.toBeTruthy();
  });

  it('email verify confirm via OTP branch', async () => {
    const ctrl = app.get(AuthController);
    authSvc.verifyEmailOtp = (jest.fn(async () => {}) as unknown) as typeof authSvc.verifyEmailOtp;
    await expect(ctrl.emailVerifyConfirm({ email: 'e@example.com', otp: '123456' } as { email: string; otp: string })).resolves.toEqual({ success: true });
  });

  it('register placeholder returns 202', async () => {
    const req = (await import('supertest')).default(app.getHttpServer());
    await req.post('/auth/register').send({ email: 'e2@example.com' }).expect(202);
  });

  it('refresh uses cookie when body missing', async () => {
    const ctrl = app.get(AuthController);
    const fakeReq: { headers: { cookie?: string } } = { headers: { cookie: 'refreshToken=abc' } };
    const out = await ctrl.refresh(
      {} as unknown as import('../../../src/lib/dto/refresh-token.dto').RefreshTokenDto,
      fakeReq as unknown as import('express').Request,
      { cookie: (() => undefined) as unknown as Response['cookie'] } as Response,
    );
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
    await expect(
      ctrl.refresh(
        {} as unknown as import('../../../src/lib/dto/refresh-token.dto').RefreshTokenDto,
        { headers: {} } as unknown as import('express').Request,
        { cookie: (() => undefined) as unknown as Response['cookie'] } as Response,
      ),
    ).rejects.toBeTruthy();
  });

  it('refresh direct call with empty cookie value hits else branch and 400', async () => {
    const ctrl = app.get(AuthController);
    await expect(
      ctrl.refresh(
        {} as unknown as import('../../../src/lib/dto/refresh-token.dto').RefreshTokenDto,
        { headers: { cookie: 'refreshToken=' } } as unknown as import('express').Request,
        { cookie: (() => undefined) as unknown as Response['cookie'] } as Response,
      ),
    ).rejects.toBeTruthy();
  });
});
