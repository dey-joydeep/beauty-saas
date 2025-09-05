import { AuthController } from './auth.controller';
import type { Response } from 'express';
import type { WebAuthnPort, RecoveryCodesPort, OAuthPort } from '@cthub-bsaas/server-contracts-auth';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';

describe('AuthController OAuth endpoints (unit)', () => {
  let controller: AuthController;
  let authSvc: jest.Mocked<
    Pick<
      AuthService,
      'linkSocialAccount' | 'unlinkSocialAccount' | 'signInWithSocial' | 'logout' | 'revokeSession' | 'listSessions'
    >
  >;
  let oauth: jest.Mocked<Pick<OAuthPort, 'start' | 'exchangeCode'>>;
  const webAuthn = {} as unknown as jest.Mocked<WebAuthnPort>;
  const recovery = {} as unknown as jest.Mocked<RecoveryCodesPort>;

  beforeEach(() => {
    authSvc = {
      linkSocialAccount: jest.fn(() => {}),
      signInWithSocial: jest.fn(() => ({ accessToken: 'AT', refreshToken: 'RT' })),
      logout: jest.fn(() => {}),
      revokeSession: jest.fn(() => ({ success: true } as const)),
      listSessions: jest.fn(() => []),
      unlinkSocialAccount: jest.fn(() => {}),
    } as unknown as typeof authSvc;
    oauth = {
      start: jest.fn(() => ({ redirectUrl: 'https://example.com/oauth' })),
      exchangeCode: jest.fn(() => ({ provider: 'google', providerUserId: 'pid' })),
    } as unknown as typeof oauth;
    const config = { get: jest.fn().mockReturnValue(undefined) } as unknown as ConfigService;
    controller = new AuthController(authSvc as unknown as AuthService, webAuthn, recovery, (oauth as unknown) as OAuthPort, config);
  });

  it('oauthStart sets 302 redirect with Location header', async () => {
    const res = ((): Response => {
      const r = {
        status: jest.fn(function (this: Response) { return r as unknown as Response; }) as unknown as Response['status'],
        setHeader: jest.fn(function (this: Response) { return r as unknown as Response; }) as unknown as Response['setHeader'],
        end: jest.fn(() => undefined) as unknown as Response['end'],
      } as Partial<Response> as Response;
      return res as Response;
    })();
    await controller.oauthStart('google', res);
    expect(oauth.start).toHaveBeenCalledWith('google');
    const statusCalls = (res as unknown as { status: jest.Mock }).status.mock.calls as unknown as unknown[][];
    const headerCalls = (res as unknown as { setHeader: jest.Mock }).setHeader.mock.calls as unknown as unknown[][];
    expect((statusCalls[0] as unknown[])[0]).toBe(302);
    expect((headerCalls[0] as unknown[])[0]).toBe('Location');
    expect((res.end as unknown as jest.Mock)).toHaveBeenCalled();
  });

  it('oauthCallback throws on missing code', async () => {
    await expect(
      controller.oauthCallback('google', {}, { } as Response, undefined, undefined),
    ).rejects.toBeTruthy();
  });

  it('oauthCallback links provider when user is authenticated', async () => {
    const out = await controller.oauthCallback('google', { user: { userId: 'u1' } }, { } as Response, 'c', 's');
    expect(oauth.exchangeCode).toHaveBeenCalledWith('google', 'c', 's');
    expect(authSvc.linkSocialAccount).toHaveBeenCalledWith('u1', 'google', 'pid');
    expect(out).toEqual({});
  });

  it('oauthCallback signs in unauthenticated user and sets cookies', async () => {
    const cookies: Record<string, { value: string; opts: unknown } | undefined> = {};
    const res: Pick<Response, 'cookie'> = {
      cookie: jest.fn(((name: string, value: string, opts: unknown) => {
        cookies[name] = { value, opts };
      }) as unknown as Response['cookie']) as unknown as Response['cookie'],
    };
    const out = await controller.oauthCallback('google', {}, (res as unknown) as Response, 'code123', 'state');
    expect(out).toEqual({});
    expect(authSvc.signInWithSocial).toHaveBeenCalled();
    expect(cookies['bsaas_at']!.value).toBe('AT');
    expect(cookies['bsaas_rt']!.value).toBe('RT');
  });

  it('oauthUnlink unlinks and returns success', async () => {
    const ok = await controller.oauthUnlink('google', { user: { userId: 'u1' } });
    expect(authSvc.unlinkSocialAccount).toHaveBeenCalledWith('u1', 'google');
    expect(ok).toEqual({ success: true });
  });
});
