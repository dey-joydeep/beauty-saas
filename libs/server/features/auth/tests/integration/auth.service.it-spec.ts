import { Test } from '@nestjs/testing';
import { AuthService } from '../../src/lib/services/auth.service';
import { AuditService } from '../../src/lib/services/audit.service';
import {
  USER_REPOSITORY,
  SESSION_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
  CREDENTIAL_TOTP_REPOSITORY,
  TOTP_PORT,
  EMAIL_PORT,
} from '@cthub-bsaas/server-contracts-auth';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { IUserRepository, ISessionRepository, IRefreshTokenRepository, ICredentialTotpRepository, TotpPort, EmailPort } from '@cthub-bsaas/server-contracts-auth';
import * as bcrypt from 'bcryptjs';
jest.mock('bcryptjs', () => ({
  compare: jest.fn(async () => true),
  hash: jest.fn(async () => 'hash'),
}));

describe('AuthService branches (integration-light)', () => {
  let service: AuthService;
  const userRepo: Pick<IUserRepository, 'findByEmail' | 'findById' | 'update'> = {
    findByEmail: async () => null,
    findById: async () => null,
    update: async () => ({} as any),
  };
  const sessionRepo: Pick<ISessionRepository, 'create' | 'findById' | 'delete' | 'findByUserId'> = {
    create: async ({ userId }: { userId: string }) => ({ id: 'sess1', userId } as any),
    findById: async () => null,
    delete: async () => ({} as any),
    findByUserId: async () => [],
  };
  const refreshRepo: Pick<IRefreshTokenRepository, 'create' | 'findByJti' | 'revoke'> = {
    create: async () => ({} as any),
    findByJti: async () => null,
    revoke: async () => ({} as any),
  };
  const credTotpRepo: Pick<ICredentialTotpRepository, 'findByUserId'> = { findByUserId: async () => null };
  const jwt: Pick<JwtService, 'signAsync' | 'verifyAsync'> = {
    signAsync: async () => 'jwt',
    verifyAsync: (async () => ({} as any)) as any,
  };
  const cfg: Pick<ConfigService, 'get'> = { get: ((k: string) => ((k.includes('REFRESH') ? 'rs' : 'as') as any)) as any } as any;
  const totp: Pick<TotpPort, 'verifyToken'> = { verifyToken: async () => true };
  const email: EmailPort = { sendMail: async () => {} } as any;
  const audit = { log: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USER_REPOSITORY, useValue: userRepo },
        { provide: SESSION_REPOSITORY, useValue: sessionRepo },
        { provide: REFRESH_TOKEN_REPOSITORY, useValue: refreshRepo },
        { provide: CREDENTIAL_TOTP_REPOSITORY, useValue: credTotpRepo },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: cfg },
        { provide: TOTP_PORT, useValue: totp },
        { provide: EMAIL_PORT, useValue: email },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  beforeEach(() => {
    // reset bcrypt mock call history
    (bcrypt.compare as unknown as jest.Mock).mockReset();
    (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(true);
  });

  const user = { id: 'u1', email: 'e@example.com', passwordHash: '$2a$10$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', roles: [] } as any;

  it('signIn invalid credentials and password', async () => {
    (userRepo.findByEmail as any) = async () => null;
    await expect(service.signIn('x@example.com', 'p')).rejects.toBeTruthy();

    (userRepo.findByEmail as any) = async () => ({ ...user, passwordHash: 'hash' });
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false as any);
    await expect(service.signIn(user.email, 'wrong')).rejects.toBeTruthy();
  });

  it('signIn totp challenge when verified', async () => {
    (userRepo.findByEmail as any) = async () => user;
    (credTotpRepo.findByUserId as any) = async () => ({ verified: true });
    // Case 1: access secret present
    (cfg as any).get = (k: string) => (k === 'JWT_ACCESS_SECRET' ? 'AS' : undefined);
    let res = await service.signIn(user.email, 'p');
    expect(res.totpRequired).toBe(true);
    // Case 2: access missing, fallback to JWT_SECRET
    (cfg as any).get = (k: string) => (k === 'JWT_SECRET' ? 'S' : undefined);
    res = await service.signIn(user.email, 'p');
    expect(res.totpRequired).toBe(true);
    // Case 3: both missing, default secret
    (cfg as any).get = (_: string) => undefined;
    res = await service.signIn(user.email, 'p');
    expect(res.totpRequired).toBe(true);
  });

  it('signIn success without totp', async () => {
    (userRepo.findByEmail as any) = async () => user;
    (credTotpRepo.findByUserId as any) = async () => null;
    const res = await service.signIn(user.email, 'p');
    expect(res.totpRequired).toBe(false);
  });

  it('signInWithTotp success and failure branches', async () => {
    (jwt.verifyAsync as any) = jest.fn(async () => ({ sub: 'u1', aud: 'totp' }));
    (userRepo.findById as any) = async () => user;
    const ok = await service.signInWithTotp('t', '123456');
    expect(ok.accessToken).toBeDefined();
    // invalid aud
    (jwt.verifyAsync as any) = jest.fn(async () => ({ sub: 'u1', aud: 'bad' }));
    await expect(service.signInWithTotp('t', '123456')).rejects.toBeTruthy();
    // invalid totp code
    (jwt.verifyAsync as any) = jest.fn(async () => ({ sub: 'u1', aud: 'totp' }));
    (totp.verifyToken as any) = async () => false;
    await expect(service.signInWithTotp('t', '000000')).rejects.toBeTruthy();
    // user not found
    (totp.verifyToken as any) = async () => true;
    (userRepo.findById as any) = async () => null;
    await expect(service.signInWithTotp('t', '123456')).rejects.toBeTruthy();
  });

  it('refreshToken success and invalid', async () => {
    (jwt.verifyAsync as any) = jest.fn(async () => ({ sub: 'u1', jti: 'j1' }));
    (refreshRepo.findByJti as any) = async () => ({ jti: 'j1', sessionId: 'sess1' });
    (userRepo.findById as any) = async () => user;
    const tokens = await service.refreshToken('rt');
    expect(tokens).toBeTruthy();
    expect(tokens!.accessToken).toBeDefined();
    (refreshRepo.findByJti as any) = async () => null;
    await expect(service.refreshToken('rt-bad')).rejects.toBeTruthy();
    // user not found branch
    (jwt.verifyAsync as any) = jest.fn(async () => ({ sub: 'no-user', jti: 'j2' }));
    (refreshRepo.findByJti as any) = async () => ({ jti: 'j2', sessionId: 'sess2' });
    (userRepo.findById as any) = async () => null;
    await expect(service.refreshToken('rt-no-user')).rejects.toBeTruthy();
  });

  it('logout branches and revokeSession', async () => {
    (sessionRepo.findById as any) = async () => null;
    await service.logout('sX');
    (sessionRepo.findById as any) = async () => ({ id: 's1', userId: 'u1' });
    await service.logout('s1');

    (sessionRepo.findById as any) = async () => ({ id: 's2', userId: 'u1' });
    await expect(service.revokeSession('u2', 's2')).rejects.toBeTruthy();
    await expect(service.revokeSession('u1', 's2')).resolves.toEqual({ success: true });
  });

  it('password reset and email verification branches', async () => {
    (userRepo.findByEmail as any) = async () => null;
    await service.requestPasswordReset('none@example.com');

    (userRepo.findByEmail as any) = async () => user;
    await service.requestPasswordReset(user.email);

    // reset success
    (jwt.verifyAsync as any) = jest.fn(async () => ({ sub: 'u1', aud: 'reset' }));
    await service.resetPassword('tok', 'NewP@ss');
    // reset invalid
    (jwt.verifyAsync as any) = jest.fn(async () => ({ sub: 'u1', aud: 'bad' }));
    await expect(service.resetPassword('tok', 'x')).rejects.toBeTruthy();

    // email verification request
    (userRepo.findByEmail as any) = async () => ({ ...user, emailVerifiedAt: new Date() });
    await service.requestEmailVerification(user.email);
    (userRepo.findByEmail as any) = async () => ({ ...user, emailVerifiedAt: null });
    await service.requestEmailVerification(user.email);

    // verify email success and failure
    (jwt.verifyAsync as any) = jest.fn(async () => ({ sub: 'u1', aud: 'verify' }));
    await service.verifyEmail('tok');
    (jwt.verifyAsync as any) = jest.fn(async () => ({ sub: 'u1', aud: 'bad' }));
    await expect(service.verifyEmail('tok')).rejects.toBeTruthy();

    // invalid/expired branches via thrown verify
    (jwt.verifyAsync as any) = jest.fn(async () => { throw new Error('bad'); });
    await expect(service.resetPassword('tok', 'x')).rejects.toBeTruthy();
    await expect(service.verifyEmail('tok')).rejects.toBeTruthy();
  });

  it('issueTokensForUser covers not found branch', async () => {
    (userRepo.findById as any) = async () => null;
    await expect(service.issueTokensForUser('nope')).rejects.toBeTruthy();
  });

  it('issueTokensForUser success', async () => {
    (userRepo.findById as any) = async () => user;
    (sessionRepo.create as any) = async ({ userId }: { userId: string }) => ({ id: 'sess2', userId });
    const tokens = await service.issueTokensForUser('u1');
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
  });

  it('covers config secret fallbacks for access/refresh', async () => {
    // Fallback to JWT_SECRET when JWT_ACCESS_SECRET is missing
    (cfg as any).get = (k: string) => (k === 'JWT_SECRET' ? 'S' : undefined);
    (userRepo.findById as any) = async () => user;
    (sessionRepo.create as any) = async ({ userId }: { userId: string }) => ({ id: 'sess3', userId });
    await service.issueTokensForUser('u1');

    // Default to test-access-secret when both missing
    (cfg as any).get = (_k: string) => undefined;
    await service.issueTokensForUser('u1');

    // Refresh path fallback to JWT_SECRET then default
    (cfg as any).get = (k: string) => (k === 'JWT_SECRET' ? 'S' : undefined);
    (jwt.verifyAsync as any) = async () => ({ sub: 'u1', jti: 'j3' });
    (refreshRepo.findByJti as any) = async () => ({ jti: 'j3', sessionId: 'sess3' });
    await service.refreshToken('rtS');

    (cfg as any).get = (_k: string) => undefined;
    (jwt.verifyAsync as any) = async () => ({ sub: 'u1', jti: 'j4' });
    (refreshRepo.findByJti as any) = async () => ({ jti: 'j4', sessionId: 'sess4' });
    await service.refreshToken('rtD');
  });

  it('covers reset/verify secret fallbacks', async () => {
    // requestPasswordReset with explicit RESET secret
    (cfg as any).get = (k: string) => (k === 'JWT_RESET_SECRET' ? 'RS' : (k === 'JWT_ACCESS_SECRET' ? 'AS' : 'S'));
    (userRepo.findByEmail as any) = async () => user;
    await service.requestPasswordReset(user.email);

    // resetPassword uses fallback to ACCESS secret
    (cfg as any).get = (k: string) => (k === 'JWT_ACCESS_SECRET' ? 'AS' : undefined);
    (jwt.verifyAsync as any) = async () => ({ sub: 'u1', aud: 'reset' });
    await service.resetPassword('tok', 'new');

    // requestEmailVerification with explicit VERIFY secret
    (cfg as any).get = (k: string) => (k === 'JWT_VERIFY_EMAIL_SECRET' ? 'VS' : (k === 'JWT_ACCESS_SECRET' ? 'AS' : undefined));
    (userRepo.findByEmail as any) = async () => ({ ...user, emailVerifiedAt: null });
    await service.requestEmailVerification(user.email);

    // verifyEmail with explicit VERIFY secret
    (cfg as any).get = (k: string) => (k === 'JWT_VERIFY_EMAIL_SECRET' ? 'VS' : undefined);
    (jwt.verifyAsync as any) = async () => ({ sub: 'u1', aud: 'verify' });
    await service.verifyEmail('tok');
    // verifyEmail fallback to ACCESS secret
    (cfg as any).get = (k: string) => (k === 'JWT_ACCESS_SECRET' ? 'AS' : undefined);
    await service.verifyEmail('tok');
  });
});
