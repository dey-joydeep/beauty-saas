import { AuthController } from './auth.controller';
import type { Response } from 'express';
import { AuthService } from '../services/auth.service';
import type { WebAuthnPort, RecoveryCodesPort } from '@cthub-bsaas/server-contracts-auth';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import type { Request as ExpressRequest } from 'express';

describe('AuthController branches (unit)', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;
  let webAuthn: jest.Mocked<WebAuthnPort>;
  let recovery: jest.Mocked<RecoveryCodesPort>;

  const createRes = () => {
    const cookies: Record<string, { value?: string; opts?: unknown } | undefined> = {};
    const res: Pick<Response, 'cookie' | 'clearCookie'> = {
      cookie: jest.fn(((name: string, value: string, opts: unknown) => {
        cookies[name] = { value, opts };
      }) as unknown as Response['cookie']) as unknown as Response['cookie'],
      clearCookie: jest.fn(((name: string, opts?: unknown) => {
        cookies[name] = { value: undefined, opts };
      }) as unknown as Response['clearCookie']) as unknown as Response['clearCookie'],
    };
    return { res: res as Response, cookies };
  };

  beforeEach(() => {
    service = {
      signIn: jest.fn(),
      refreshToken: jest.fn(),
      logout: jest.fn(),
      listSessions: jest.fn(),
      revokeSession: jest.fn(),
      signInWithTotp: jest.fn(),
      requestPasswordReset: jest.fn(),
      resetPassword: jest.fn(),
      requestEmailVerification: jest.fn(),
      verifyEmail: jest.fn(),
      verifyEmailOtp: jest.fn(),
      issueTokensForUser: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;
    webAuthn = {
      startRegistration: jest.fn().mockResolvedValue({ ok: 1 } as unknown as Record<string, unknown>),
      finishRegistration: jest.fn().mockResolvedValue(undefined as unknown as void),
      startAuthentication: jest.fn().mockResolvedValue({ request: true } as unknown as Record<string, unknown>),
      finishAuthentication: jest.fn().mockResolvedValue(undefined as unknown as void),
    } as unknown as jest.Mocked<WebAuthnPort>;
    recovery = {
      generate: jest.fn().mockResolvedValue(['r1', 'r2']),
      verifyAndConsume: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<RecoveryCodesPort>;
    const config = { get: jest.fn().mockReturnValue(undefined) } as unknown as ConfigService;
    controller = new AuthController(service, webAuthn, recovery, config);
  });

  it('signIn branches: totpRequired false and true', async () => {
    // non-TOTP path
    service.signIn.mockResolvedValueOnce({ totpRequired: false, accessToken: 'at', refreshToken: 'rt' });
    const { res: res1, cookies: c1 } = createRes();
    const out1 = await controller.signIn({ email: 'e', password: 'p' } as LoginDto, res1);
    expect(out1).toEqual({ totpRequired: false });
    expect(c1['bsaas_at']?.value).toBe('at');
    expect(c1['bsaas_rt']?.value).toBe('rt');
    expect(c1['XSRF-TOKEN']).toBeDefined();

    // TOTP required path
    service.signIn.mockResolvedValueOnce({ totpRequired: true, tempToken: 'tmp' });
    const { res: res2 } = createRes();
    const out2 = await controller.signIn({ email: 'e', password: 'p' } as LoginDto, res2);
    expect(out2).toEqual({ totpRequired: true, tempToken: 'tmp' });
  });

  it('refresh branches: cookie token, body token, unrelated cookie, no service refresh token, and missing token error', async () => {
    // cookie present path (bsaas_rt)
    service.refreshToken.mockResolvedValueOnce({ accessToken: 'A1', refreshToken: 'R1' });
    const { res: res1, cookies: c1 } = createRes();
    const req1 = { headers: { cookie: 'bsaas_rt=x' } } as unknown as ExpressRequest;
    const out1 = await controller.refresh({} as RefreshTokenDto, req1, res1);
    expect(out1).toEqual({});
    expect(c1['bsaas_at']?.value).toBe('A1');
    expect(c1['bsaas_rt']?.value).toBe('R1');
    expect(c1['XSRF-TOKEN']).toBeDefined();

    // fall back to body token
    service.refreshToken.mockResolvedValueOnce({ accessToken: 'A2', refreshToken: 'R2' });
    const { res: res2, cookies: c2 } = createRes();
    const req2 = { headers: {} } as unknown as ExpressRequest;
    await controller.refresh({ refreshToken: 'from-body' } as RefreshTokenDto, req2, res2);
    expect(c2['bsaas_at']?.value).toBe('A2');
    expect(c2['bsaas_rt']?.value).toBe('R2');

    // unrelated cookie header, use body
    service.refreshToken.mockResolvedValueOnce({ accessToken: 'A3', refreshToken: 'R3' });
    const { res: res3, cookies: c3 } = createRes();
    const req3 = { headers: { cookie: 'foo=bar; XSRF-TOKEN=abc' } } as unknown as ExpressRequest;
    await controller.refresh({ refreshToken: 'from-body-2' } as RefreshTokenDto, req3, res3);
    expect(c3['bsaas_at']?.value).toBe('A3');
    expect(c3['bsaas_rt']?.value).toBe('R3');

    // service returns no refreshToken
    service.refreshToken.mockResolvedValueOnce(undefined as unknown as { accessToken: string; refreshToken: string });
    const { res: res4, cookies: c4 } = createRes();
    const req4 = { headers: {} } as unknown as ExpressRequest;
    await controller.refresh({ refreshToken: 'body' } as RefreshTokenDto, req4, res4);
    expect(c4['bsaas_rt']).toBeUndefined();

    // missing token entirely -> error
    const { res: res5 } = createRes();
    const req5 = { headers: {} } as unknown as ExpressRequest;
    await expect(controller.refresh({} as RefreshTokenDto, req5, res5)).rejects.toThrow();
  });

  it('logout clears cookies', async () => {
    const { res } = createRes();
    await controller.logout({ user: { sessionId: 's1' } } as { user: { sessionId: string } }, res);
    const clear = res.clearCookie as unknown as jest.Mock;
    expect(clear).toHaveBeenCalledWith('bsaas_rt', expect.any(Object));
    expect(clear).toHaveBeenCalledWith('bsaas_at', expect.any(Object));
  });

  it('sessions and revoke endpoints', async () => {
    service.listSessions.mockResolvedValueOnce([{ id: 's1' }]);
    const list = await controller.listSessions({ user: { userId: 'u1' } } as { user: { userId: string } });
    expect(list).toEqual([{ id: 's1' }]);

    service.revokeSession.mockResolvedValueOnce({ success: true });
    const ok = await controller.revokeSession({ user: { userId: 'u1' } } as { user: { userId: string } }, 's1');
    expect(ok).toEqual({ success: true });

    service.revokeSession.mockResolvedValueOnce({ success: true });
    const ok2 = await controller.revokeSessionBody({ user: { userId: 'u1' } } as { user: { userId: string } }, { id: 's1' });
    expect(ok2).toEqual({ success: true });
  });

  it('TOTP login completes and sets cookies', async () => {
    service.signInWithTotp.mockResolvedValueOnce({ accessToken: 'AT', refreshToken: 'RT' });
    const { res, cookies } = createRes();
    const out = await controller.signInWithTotp({ tempToken: 't', totpCode: '123456' } as { tempToken: string; totpCode: string }, res);
    expect(out).toEqual({});
    expect(cookies['bsaas_at']?.value).toBe('AT');
    expect(cookies['bsaas_rt']?.value).toBe('RT');
  });

  it('account recovery and email flows', async () => {
    service.requestPasswordReset.mockResolvedValueOnce(undefined);
    expect(await controller.forgotPassword({ email: 'e' })).toEqual({ success: true });

    service.resetPassword.mockResolvedValueOnce(undefined);
    expect(await controller.resetPassword({ token: 't', newPassword: 'p' })).toEqual({ success: true });

    service.requestEmailVerification.mockResolvedValueOnce(undefined);
    expect(await controller.sendEmailVerification({ email: 'e' })).toEqual({ success: true });

    service.verifyEmail.mockResolvedValueOnce(undefined);
    expect(await controller.verifyEmail({ token: 't' })).toEqual({ success: true });

    service.requestEmailVerification.mockResolvedValueOnce(undefined);
    expect(await controller.emailVerifyRequest({ email: 'e' })).toEqual({ success: true });

    service.verifyEmail.mockResolvedValueOnce(undefined);
    expect(await controller.emailVerifyConfirm({ token: 't' })).toEqual({ success: true });
    service.verifyEmailOtp.mockResolvedValueOnce(undefined);
    expect(await controller.emailVerifyConfirm({ email: 'e', otp: '123456' })).toEqual({ success: true });
    await expect(controller.emailVerifyConfirm({} as { token?: string; email?: string; otp?: string })).rejects.toThrow();
  });

  it('WebAuthn flows', async () => {
    const start = await controller.webauthnRegisterStart({ username: 'name' }, { user: { userId: 'u1' } } as { user: { userId: string } });
    expect(start).toBeDefined();
    const finish = await controller.webauthnRegisterFinish({}, { user: { userId: 'u1' } } as { user: { userId: string } });
    expect(finish).toEqual({ success: true });

    await expect(controller.webauthnLoginStart({} as { user?: { userId: string } })).rejects.toThrow();
    const reqStart = await controller.webauthnLoginStart({ user: { userId: 'u1' } } as { user?: { userId: string } });
    expect(reqStart).toEqual({ request: true });

    service.issueTokensForUser.mockResolvedValueOnce({ accessToken: 'A', refreshToken: 'R' });
    const { res, cookies } = createRes();
    const done = await controller.webauthnLoginFinish({}, { user: { userId: 'u1' } } as { user: { userId: string } }, res);
    expect(done).toEqual({});
    expect(cookies['bsaas_at']?.value).toBe('A');
    expect(cookies['bsaas_rt']?.value).toBe('R');
  });

  it('recovery generate/verify branches', async () => {
    const codes = await controller.generateRecovery({ user: { userId: 'u1' } } as { user: { userId: string } });
    expect(codes).toEqual(['r1', 'r2']);
    // success branch
    recovery.verifyAndConsume.mockResolvedValueOnce(true);
    await expect(controller.verifyRecovery({ code: 'ok' }, { user: { userId: 'u1' } } as { user: { userId: string } })).resolves.toEqual({ success: true });
    recovery.verifyAndConsume.mockResolvedValueOnce(false);
    await expect(controller.verifyRecovery({ code: 'x' }, { user: { userId: 'u1' } } as { user: { userId: string } })).rejects.toThrow();
  });

  it('register placeholder', () => {
    expect(controller.registerPlaceholder()).toEqual({ success: true });
  });
});
