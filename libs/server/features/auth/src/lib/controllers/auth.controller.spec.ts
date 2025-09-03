import { AuthController } from './auth.controller';
import type { Response } from 'express';
import { AuthService } from '../services/auth.service';
import type { WebAuthnPort, RecoveryCodesPort } from '@cthub-bsaas/server-contracts-auth';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;
  let webAuthn: jest.Mocked<WebAuthnPort>;
  let recovery: jest.Mocked<RecoveryCodesPort>;

  const createRes = () => {
    const cookies: Record<string, any> = {};
    const res: Partial<Response> = {
      cookie: jest.fn((name: string, value: string, opts: any) => {
        cookies[name] = { value, opts };
      }) as any,
      clearCookie: jest.fn((name: string) => {
        cookies[name] = undefined;
      }) as any,
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
      issueTokensForUser: jest.fn(),
    } as any;
    webAuthn = {
      startRegistration: jest.fn(),
      finishRegistration: jest.fn(),
      startAuthentication: jest.fn(),
      finishAuthentication: jest.fn(),
    } as any;
    recovery = {
      generate: jest.fn(),
      verifyAndConsume: jest.fn(),
    } as any;
    controller = new AuthController(service, webAuthn as any, recovery as any);
  });

  it('signIn sets CSRF and refresh cookies when no TOTP', async () => {
    service.signIn.mockResolvedValue({ totpRequired: false, accessToken: 'at', refreshToken: 'rt' });
    const { res, cookies } = createRes();
    const result = await controller.signIn({ email: 'e', password: 'p' } as any, res);
    expect(result).toEqual({ totpRequired: false, accessToken: 'at' });
    expect(cookies['XSRF-TOKEN']).toBeDefined();
    expect(cookies['refreshToken'].value).toBe('rt');
    expect(cookies['refreshToken'].opts.httpOnly).toBe(true);
  });

  it('signIn returns temp token when TOTP required', async () => {
    service.signIn.mockResolvedValue({ totpRequired: true, tempToken: 'temp' } as any);
    const { res } = createRes();
    const result = await controller.signIn({ email: 'e', password: 'p' } as any, res);
    expect(result).toEqual({ totpRequired: true, tempToken: 'temp' });
  });

  it('refresh rotates cookies and returns access token', async () => {
    service.refreshToken.mockResolvedValue({ accessToken: 'new-at', refreshToken: 'new-rt' } as any);
    const { res, cookies } = createRes();
    const req = { headers: { cookie: 'refreshToken=old' } } as any;
    const result = await controller.refresh({} as any, req, res);
    expect(result).toEqual({ accessToken: 'new-at' });
    expect(cookies['refreshToken'].value).toBe('new-rt');
    expect(cookies['XSRF-TOKEN']).toBeDefined();
  });

  it('refresh reads token from body when cookie missing', async () => {
    service.refreshToken.mockResolvedValue({ accessToken: 'at2', refreshToken: 'rt2' } as any);
    const { res, cookies } = createRes();
    const req = { headers: {} } as any;
    const result = await controller.refresh({ refreshToken: 'from-body' } as any, req, res);
    expect(result).toEqual({ accessToken: 'at2' });
    expect(cookies['refreshToken'].value).toBe('rt2');
  });

  it('refresh falls back to body when cookie header present but no refreshToken pair', async () => {
    service.refreshToken.mockResolvedValue({ accessToken: 'at3', refreshToken: 'rt3' } as any);
    const { res, cookies } = createRes();
    const req = { headers: { cookie: 'foo=bar; XSRF-TOKEN=abc' } } as any;
    const result = await controller.refresh({ refreshToken: 'from-body-2' } as any, req, res);
    expect(result).toEqual({ accessToken: 'at3' });
    expect(cookies['refreshToken'].value).toBe('rt3');
  });

  it('refresh does not set cookie when service returns no refreshToken', async () => {
    service.refreshToken.mockResolvedValue({ accessToken: 'only-at' } as any);
    const { res, cookies } = createRes();
    const req = { headers: { cookie: '' } } as any;
    const result = await controller.refresh({ refreshToken: 'from-body' } as any, req, res);
    expect(result).toEqual({ accessToken: 'only-at' });
    expect(cookies['refreshToken']).toBeUndefined();
  });

  it('refresh throws when cookie has empty refreshToken value and body missing', async () => {
    const { res } = createRes();
    const req = { headers: { cookie: 'refreshToken=; XSRF-TOKEN=abc' } } as any;
    await expect(controller.refresh({} as any, req, res)).rejects.toThrow();
  });

  it('signInWithTotp proxies to service', async () => {
    service.signInWithTotp.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' } as any);
    const result = await controller.signInWithTotp({ tempToken: 't', totpCode: '123456' } as any);
    expect(result).toEqual({ accessToken: 'a', refreshToken: 'r' });
  });

  it('webauthn register start/finish call ports and return values', async () => {
    webAuthn.startRegistration.mockResolvedValue({ challenge: 'c' } as any);
    const start = await controller.webauthnRegisterStart({ username: 'u' } as any, { user: { userId: 'uid' } } as any);
    expect(start).toEqual({ challenge: 'c' });

    webAuthn.finishRegistration.mockResolvedValue(undefined as any);
    const finish = await controller.webauthnRegisterFinish({} as any, { user: { userId: 'uid' } } as any);
    expect(finish).toEqual({ success: true });
  });

  it('webauthn login start/finish work and set cookie', async () => {
    webAuthn.startAuthentication.mockResolvedValue({ request: true } as any);
    const start = await controller.webauthnLoginStart({ user: { userId: 'u1' } } as any);
    expect(start).toEqual({ request: true });

    service.issueTokensForUser.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' } as any);
    const { res, cookies } = createRes();
    const finish = await controller.webauthnLoginFinish({} as any, { user: { userId: 'u1' } } as any, res);
    expect(finish).toEqual({ accessToken: 'a' });
    expect(cookies['refreshToken'].value).toBe('r');
  });

  it('recovery generate/verify call ports and return success', async () => {
    recovery.generate.mockResolvedValue(['code1'] as any);
    const codes = await controller.generateRecovery({ user: { userId: 'u1' } } as any);
    expect(codes).toEqual(['code1']);

    recovery.verifyAndConsume.mockResolvedValue(true as any);
    const ok = await controller.verifyRecovery({ code: 'x' } as any, { user: { userId: 'u1' } } as any);
    expect(ok).toEqual({ success: true });
  });

  it('verifyRecovery throws when code invalid', async () => {
    recovery.verifyAndConsume.mockResolvedValue(false as any);
    await expect(controller.verifyRecovery({ code: 'bad' } as any, { user: { userId: 'u1' } } as any)).rejects.toThrow();
  });

  it('refresh throws when no token provided', async () => {
    const { res } = createRes();
    const req = { headers: {} } as any;
    await expect(controller.refresh({} as any, req, res)).rejects.toThrow();
  });

  it('webauthnLoginStart throws without user context', async () => {
    await expect(controller.webauthnLoginStart({} as any)).rejects.toThrow();
  });

  it('logout clears cookie and calls service', async () => {
    const { res } = createRes();
    await controller.logout({ user: { sessionId: 's1' } } as any, res);
    expect(service.logout).toHaveBeenCalledWith('s1');
    expect((res.clearCookie as any)).toHaveBeenCalledWith('refreshToken', { path: '/' });
  });

  it('listSessions proxies to service', async () => {
    service.listSessions.mockResolvedValue([{ id: 's1' }]);
    const result = await controller.listSessions({ user: { userId: 'u1' } } as any);
    expect(result).toEqual([{ id: 's1' }]);
  });

  it('revokeSession proxies to service', async () => {
    service.revokeSession.mockResolvedValue({ success: true } as any);
    const result = await controller.revokeSession({ user: { userId: 'u1' } } as any, 's1');
    expect(result).toEqual({ success: true });
  });

  it('forgot/reset/email verify flows call service and return success', async () => {
    service.requestPasswordReset.mockResolvedValue(undefined as any);
    const forgot = await controller.forgotPassword({ email: 'e' } as any);
    expect(forgot).toEqual({ success: true });

    service.resetPassword.mockResolvedValue(undefined as any);
    const reset = await controller.resetPassword({ token: 't', newPassword: 'p' } as any);
    expect(reset).toEqual({ success: true });

    service.requestEmailVerification.mockResolvedValue(undefined as any);
    const send = await controller.sendEmailVerification({ email: 'e' } as any);
    expect(send).toEqual({ success: true });

    service.verifyEmail.mockResolvedValue(undefined as any);
    const verify = await controller.verifyEmail({ token: 't' } as any);
    expect(verify).toEqual({ success: true });
  });
});
