import { AuthController } from './auth.controller';
import type { Response, Request as ExpressRequest } from 'express';
import { AuthService } from '../services/auth.service';
import type { WebAuthnPort, RecoveryCodesPort, OAuthPort } from '@cthub-bsaas/server-contracts-auth';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import type { WebauthnAttestationDto } from '../dto/webauthn-attestation.dto';
import type { WebauthnAssertionDto } from '../dto/webauthn-assertion.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;
  let webAuthn: jest.Mocked<WebAuthnPort>;
  let recovery: jest.Mocked<RecoveryCodesPort>;

  const createRes = () => {
    const cookies: Record<string, { value: string; opts: unknown } | undefined> = {};
    const res: Pick<Response, 'cookie' | 'clearCookie'> = {
      cookie: jest.fn(((name: string, value: string, opts: unknown) => {
        cookies[name] = { value, opts };
      }) as unknown as Response['cookie']) as unknown as Response['cookie'],
      clearCookie: jest.fn(((name: string) => {
        cookies[name] = undefined;
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
      startRegistration: jest.fn(),
      finishRegistration: jest.fn(),
      startAuthentication: jest.fn(),
      finishAuthentication: jest.fn(),
    } as unknown as jest.Mocked<WebAuthnPort>;
    recovery = {
      generate: jest.fn(),
      verifyAndConsume: jest.fn(),
    } as unknown as jest.Mocked<RecoveryCodesPort>;
    const config = { get: jest.fn().mockReturnValue(undefined) } as unknown as ConfigService;
    (service.resolveUserIdByEmail as unknown as jest.Mock) = jest.fn(() => Promise.resolve('u-by-email'));
    const oauth = { start: jest.fn() } as unknown as OAuthPort;
    controller = new AuthController(service, webAuthn, recovery, oauth, config);
  });

  it('signIn sets CSRF and auth cookies when no TOTP', async () => {
    service.signIn.mockResolvedValue({ totpRequired: false, accessToken: 'at', refreshToken: 'rt' });
    const { res, cookies } = createRes();
    const result = await controller.signIn({ email: 'e', password: 'p' } as LoginDto, res);
    expect(result).toEqual({ totpRequired: false });
    expect(cookies['XSRF-TOKEN']).toBeDefined();
    expect(cookies['bsaas_at']!.value).toBe('at');
    expect(cookies['bsaas_rt']!.value).toBe('rt');
  });

  it('signIn returns temp token when TOTP required', async () => {
    service.signIn.mockResolvedValue({ totpRequired: true, tempToken: 'temp' });
    const { res } = createRes();
    const result = await controller.signIn({ email: 'e', password: 'p' } as LoginDto, res);
    expect(result).toEqual({ totpRequired: true, tempToken: 'temp' });
  });

  it('refresh rotates cookies and returns empty body', async () => {
    service.refreshToken.mockResolvedValue({ accessToken: 'new-at', refreshToken: 'new-rt' });
    const { res, cookies } = createRes();
    const req1 = { headers: { cookie: 'bsaas_rt=old' } } as unknown as ExpressRequest;
    const result = await controller.refresh({} as RefreshTokenDto, req1, res);
    expect(result).toEqual({});
    expect(cookies['bsaas_rt']!.value).toBe('new-rt');
    expect(cookies['bsaas_at']!.value).toBe('new-at');
    expect(cookies['XSRF-TOKEN']).toBeDefined();
  });

  it('refresh reads token from body when cookie missing', async () => {
    service.refreshToken.mockResolvedValue({ accessToken: 'at2', refreshToken: 'rt2' });
    const { res, cookies } = createRes();
    const req2 = { headers: {} } as unknown as ExpressRequest;
    const result = await controller.refresh({ refreshToken: 'from-body' } as RefreshTokenDto, req2, res);
    expect(result).toEqual({});
    expect(cookies['bsaas_rt']!.value).toBe('rt2');
    expect(cookies['bsaas_at']!.value).toBe('at2');
  });

  it('refresh falls back to body when cookie header present but no refreshToken pair', async () => {
    service.refreshToken.mockResolvedValue({ accessToken: 'at3', refreshToken: 'rt3' });
    const { res, cookies } = createRes();
    const req3 = { headers: { cookie: 'foo=bar; XSRF-TOKEN=abc' } } as unknown as ExpressRequest;
    const result = await controller.refresh({ refreshToken: 'from-body-2' } as RefreshTokenDto, req3, res);
    expect(result).toEqual({});
    expect(cookies['bsaas_rt']!.value).toBe('rt3');
    expect(cookies['bsaas_at']!.value).toBe('at3');
  });

  it('refresh does not set cookie when service returns no refreshToken', async () => {
    service.refreshToken.mockResolvedValue(undefined as unknown as { accessToken: string; refreshToken: string });
    const { res, cookies } = createRes();
    const req4 = { headers: { cookie: '' } } as unknown as ExpressRequest;
    const result = await controller.refresh({ refreshToken: 'from-body' } as RefreshTokenDto, req4, res);
    expect(result).toEqual({});
    expect(cookies['bsaas_rt']).toBeUndefined();
  });

  it('refresh throws when cookie has empty refreshToken value and body missing', async () => {
    const { res } = createRes();
    const req5 = { headers: { cookie: 'refreshToken=; XSRF-TOKEN=abc' } } as unknown as ExpressRequest;
    await expect(controller.refresh({} as RefreshTokenDto, req5, res)).rejects.toThrow();
  });

  it('signInWithTotp sets cookies and returns empty body', async () => {
    service.signInWithTotp.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' });
    const { res, cookies } = createRes();
    const result = await controller.signInWithTotp({ tempToken: 't', totpCode: '123456' } as { tempToken: string; totpCode: string }, res);
    expect(result).toEqual({});
    expect(cookies['bsaas_at']!.value).toBe('a');
    expect(cookies['bsaas_rt']!.value).toBe('r');
  });

  it('webauthn register start/finish call ports and return values', async () => {
    webAuthn.startRegistration.mockResolvedValue({ challenge: 'c' } as Record<string, unknown>);
    const start = await controller.webauthnRegisterStart({ username: 'u' }, { user: { userId: 'uid' } } as { user: { userId: string } });
    expect(start).toEqual({ challenge: 'c' });

    webAuthn.finishRegistration.mockResolvedValue({ credentialId: 'cid', counter: 0 } as { credentialId: string; counter: number });
    const finish = await controller.webauthnRegisterFinish({ response: {} } as unknown as WebauthnAttestationDto, { user: { userId: 'uid' } } as { user: { userId: string } });
    expect(finish).toEqual({ success: true });
  });

  it('webauthn login start/finish work and set cookie', async () => {
    webAuthn.startAuthentication.mockResolvedValue({ request: true } as Record<string, unknown>);
    const start = await controller.webauthnLoginStart({}, { user: { userId: 'u1' } } as { user?: { userId: string } });
    expect(start).toEqual({ request: true });

    service.issueTokensForUser.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' });
    const { res, cookies } = createRes();
    const finish = await controller.webauthnLoginFinish({ response: {} } as unknown as WebauthnAssertionDto, { user: { userId: 'u1' } } as { user: { userId: string } }, res);
    expect(finish).toEqual({});
    expect(cookies['bsaas_rt']!.value).toBe('r');
    expect(cookies['bsaas_at']!.value).toBe('a');
  });

  it('recovery generate/verify call ports and return success', async () => {
    recovery.generate.mockResolvedValue(['code1']);
    const codes = await controller.generateRecovery({ user: { userId: 'u1' } } as { user: { userId: string } });
    expect(codes).toEqual(['code1']);
    const codesAlias = await controller.generateRecoveryCodes({ user: { userId: 'u1' } } as { user: { userId: string } });
    expect(codesAlias).toEqual(['code1']);

    recovery.verifyAndConsume.mockResolvedValue(true);
    const ok = await controller.verifyRecovery({ code: 'x' }, { user: { userId: 'u1' } } as { user: { userId: string } });
    expect(ok).toEqual({ success: true });
  });

  it('verifyRecovery throws when code invalid', async () => {
    recovery.verifyAndConsume.mockResolvedValue(false);
    await expect(controller.verifyRecovery({ code: 'bad' }, { user: { userId: 'u1' } } as { user: { userId: string } })).rejects.toThrow();
  });

  it('refresh throws when no token provided', async () => {
    const { res } = createRes();
    const req6 = { headers: {} } as unknown as ExpressRequest;
    await expect(controller.refresh({} as RefreshTokenDto, req6, res)).rejects.toThrow();
  });

  it('webauthnLoginStart throws without identity', async () => {
    await expect(controller.webauthnLoginStart({}, {} as { user?: { userId: string } })).rejects.toThrow();
  });

  it('webauthnLoginStart resolves user by email when unauthenticated', async () => {
    (service.resolveUserIdByEmail as unknown as jest.Mock) = jest.fn(() => Promise.resolve('u-by-email'));
    (webAuthn.startAuthentication as unknown as jest.Mock).mockResolvedValue({ request: true } as unknown as Record<string, unknown>);
    const req = await controller.webauthnLoginStart({ email: 'e@example.com' } as { email?: string }, {} as { user?: { userId: string } });
    expect(req).toBeDefined();
  });

  it('logout clears cookie and calls service', async () => {
    const { res } = createRes();
    await controller.logout({ user: { sessionId: 's1' } } as { user: { sessionId: string } }, res);
    expect(service.logout).toHaveBeenCalledWith('s1');
    const clear = res.clearCookie as unknown as jest.Mock;
    expect(clear).toHaveBeenCalledWith('bsaas_rt', expect.any(Object));
    expect(clear).toHaveBeenCalledWith('bsaas_at', expect.any(Object));
  });

  it('listSessions proxies to service', async () => {
    service.listSessions.mockResolvedValue([{ id: 's1' }]);
    const result = await controller.listSessions({ user: { userId: 'u1' } } as { user: { userId: string } });
    expect(result).toEqual([{ id: 's1' }]);
  });

  it('revokeSession proxies to service', async () => {
    service.revokeSession.mockResolvedValue({ success: true });
    const result = await controller.revokeSession({ user: { userId: 'u1' } } as { user: { userId: string } }, 's1');
    expect(result).toEqual({ success: true });
  });

  it('revokeSessionBody proxies to service', async () => {
    (service.revokeSession as unknown as jest.Mock).mockResolvedValue({ success: true });
    const ok = await controller.revokeSessionBody({ user: { userId: 'u1' } } as { user: { userId: string } }, { id: 's1' } as { id: string });
    expect(ok).toEqual({ success: true });
  });

  it('registerPlaceholder returns success', async () => {
    const ok = await controller.registerPlaceholder();
    expect(ok).toEqual({ success: true });
  });

  it('forgot/reset/email verify flows call service and return success', async () => {
    service.requestPasswordReset.mockResolvedValue(undefined);
    const forgot = await controller.forgotPassword({ email: 'e' });
    expect(forgot).toEqual({ success: true });

    service.resetPassword.mockResolvedValue(undefined);
    const reset = await controller.resetPassword({ token: 't', newPassword: 'p' });
    expect(reset).toEqual({ success: true });

    service.requestEmailVerification.mockResolvedValue(undefined);
    const send = await controller.sendEmailVerification({ email: 'e' });
    expect(send).toEqual({ success: true });

    service.verifyEmail.mockResolvedValue(undefined);
    const verify = await controller.verifyEmail({ token: 't' });
    expect(verify).toEqual({ success: true });
  });

  it('emailVerifyRequest calls service and returns success', async () => {
    (service.requestEmailVerification as unknown as jest.Mock).mockResolvedValue(undefined);
    const ok = await controller.emailVerifyRequest({ email: 'e' });
    expect(ok).toEqual({ success: true });
  });

  it('emailVerifyConfirm handles token and otp branches and throws on bad input', async () => {
    (service.verifyEmail as unknown as jest.Mock).mockResolvedValue(undefined);
    const ok1 = await controller.emailVerifyConfirm({ token: 't' });
    expect(ok1).toEqual({ success: true });

    service.verifyEmailOtp = jest.fn().mockResolvedValue(undefined);
    const ok2 = await controller.emailVerifyConfirm({ email: 'e', otp: '123456' });
    expect(ok2).toEqual({ success: true });

    await expect(controller.emailVerifyConfirm({} as { token?: string; email?: string; otp?: string })).rejects.toThrow();
  });
});
