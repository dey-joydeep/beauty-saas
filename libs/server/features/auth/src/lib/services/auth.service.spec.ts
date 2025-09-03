import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { mock, MockProxy } from 'jest-mock-extended';
import { User, CredentialTOTP, Session } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { ICredentialTotpRepository, IRefreshTokenRepository, ISessionRepository, IUserRepository, TotpPort, EMAIL_PORT, EmailPort, USER_REPOSITORY, SESSION_REPOSITORY, REFRESH_TOKEN_REPOSITORY, CREDENTIAL_TOTP_REPOSITORY, TOTP_PORT } from '@cthub-bsaas/server-contracts-auth';
import { AuditService } from '../services/audit.service';
import { AuthService } from './auth.service';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: MockProxy<IUserRepository>;
  let sessionRepository: MockProxy<ISessionRepository>;
  let refreshTokenRepository: MockProxy<IRefreshTokenRepository>;
  let credentialTotpRepository: MockProxy<ICredentialTotpRepository>;
  let jwtService: MockProxy<JwtService>;
  let configService: MockProxy<ConfigService>;
  let totpService: MockProxy<TotpPort>;
  let emailPort: EmailPort;

  const mockUser: User = {
    id: 'user-id',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashed-password',
    phone: null,
    isVerified: true,
    isActive: true,
    avatarUrl: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    salonTenantId: null,
    emailVerifiedAt: new Date(),
  };
  const mockUserWithRoles = {
    ...mockUser,
    roles: [] as { role: { name: string } }[],
  } as User & { roles: { role: { name: string } }[] };

  beforeEach(async () => {
    userRepository = mock<IUserRepository>();
    sessionRepository = mock<ISessionRepository>();
    refreshTokenRepository = mock<IRefreshTokenRepository>();
    credentialTotpRepository = mock<ICredentialTotpRepository>();
    jwtService = mock<JwtService>();
    configService = mock<ConfigService>();
    totpService = mock<TotpPort>();
    emailPort = { sendMail: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USER_REPOSITORY, useValue: userRepository },
        { provide: SESSION_REPOSITORY, useValue: sessionRepository },
        { provide: REFRESH_TOKEN_REPOSITORY, useValue: refreshTokenRepository },
        { provide: CREDENTIAL_TOTP_REPOSITORY, useValue: credentialTotpRepository },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: TOTP_PORT, useValue: totpService },
        { provide: EMAIL_PORT, useValue: emailPort },
        { provide: AuditService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    const email = 'test@example.com';
    const password = 'password';
    const session = { id: 'session-id' } as Session;

    it('should return tokens for valid credentials when TOTP is not enabled', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUserWithRoles);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      credentialTotpRepository.findByUserId.mockResolvedValue(null);
      sessionRepository.create.mockResolvedValue(session);
      jwtService.signAsync.mockResolvedValue('some-token');
      // @ts-expect-error - private method
      jest.spyOn(service, 'generateTokens').mockResolvedValue({ accessToken: 'access-token', refreshToken: 'refresh-token' });

      const result = await service.signIn(email, password);

      expect(result).toEqual({ totpRequired: false, accessToken: 'access-token', refreshToken: 'refresh-token' });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      await expect(service.signIn(email, password)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUserWithRoles);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.signIn(email, password)).rejects.toThrow(UnauthorizedException);
    });

    it('should return a temporary token if TOTP is enabled', async () => {
      const totpCredential = { verified: true } as CredentialTOTP;
      userRepository.findByEmail.mockResolvedValue(mockUserWithRoles);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      credentialTotpRepository.findByUserId.mockResolvedValue(totpCredential);
      jwtService.signAsync.mockResolvedValue('temporary-token');

      const result = await service.signIn(email, password);

      expect(result).toEqual({ totpRequired: true, tempToken: 'temporary-token' });
    });
  });

  describe('signInWithTotp', () => {
    const tempToken = 'temp-token';
    const totpCode = '123456';
    const session = { id: 'session-id' } as Session;
    const decodedTempToken = { sub: mockUser.id, aud: 'totp' };

    it('should return tokens for a valid temp token and TOTP code', async () => {
      jwtService.verifyAsync.mockResolvedValue(decodedTempToken);
      totpService.verifyToken.mockResolvedValue(true);
      userRepository.findById.mockResolvedValue(mockUserWithRoles);
      sessionRepository.create.mockResolvedValue(session);
      // @ts-expect-error - private method
      jest.spyOn(service, 'generateTokens').mockResolvedValue({ accessToken: 'access-token', refreshToken: 'refresh-token' });

      const result = await service.signInWithTotp(tempToken, totpCode);

      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(tempToken, expect.any(Object));
      expect(totpService.verifyToken).toHaveBeenCalledWith(mockUser.id, totpCode);
    });

    it('should throw UnauthorizedException for an invalid temp token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error());
      await expect(service.signInWithTotp(tempToken, totpCode)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for an invalid TOTP code', async () => {
      jwtService.verifyAsync.mockResolvedValue(decodedTempToken);
      totpService.verifyToken.mockResolvedValue(false);
      await expect(service.signInWithTotp(tempToken, totpCode)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('account recovery', () => {
    it('requests password reset (no disclosure)', async () => {
      userRepository.findByEmail.mockResolvedValue({ ...mockUserWithRoles });
      jwtService.signAsync.mockResolvedValue('reset-token');
      await expect(service.requestPasswordReset('test@example.com')).resolves.toBeUndefined();
      expect(emailPort.sendMail).toHaveBeenCalled();
    });

    it('resets password with valid token', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: mockUserWithRoles.id, aud: 'reset' });
      const updated: User = { ...mockUser, updatedAt: new Date() };
      userRepository.update.mockResolvedValue(updated);
      await expect(service.resetPassword('reset-token', 'newpass')).resolves.toBeUndefined();
      expect(userRepository.update).toHaveBeenCalled();
    });

    it('requests email verification', async () => {
      const unver: User & { roles: { role: { name: string } }[] } = {
        ...mockUserWithRoles,
        emailVerifiedAt: null,
      };
      userRepository.findByEmail.mockResolvedValue(unver);
      jwtService.signAsync.mockResolvedValue('verify-token');
      await expect(service.requestEmailVerification('test@example.com')).resolves.toBeUndefined();
      expect(emailPort.sendMail).toHaveBeenCalled();
    });

    it('verifies email with valid token', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: mockUserWithRoles.id, aud: 'verify' });
      const updated: User = { ...mockUser, emailVerifiedAt: new Date(), updatedAt: new Date() };
      userRepository.update.mockResolvedValue(updated);
      await expect(service.verifyEmail('verify-token')).resolves.toBeUndefined();
      expect(userRepository.update).toHaveBeenCalled();
    });
  });

  describe('audience and token guards', () => {
    it('signInWithTotp throws when audience is not totp', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: mockUser.id, aud: 'wrong' } as any);
      await expect(service.signInWithTotp('t', '123456')).rejects.toThrow(UnauthorizedException);
    });

    it('resetPassword throws on wrong audience', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: mockUser.id, aud: 'wrong' } as any);
      await expect(service.resetPassword('t', 'p')).rejects.toThrow(UnauthorizedException);
    });

    it('verifyEmail throws on wrong audience', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: mockUser.id, aud: 'wrong' } as any);
      await expect(service.verifyEmail('t')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('sessions and tokens', () => {
    it('refreshes token on valid refresh token', async () => {
      const jti = 'jti-1';
      const sessionId = 'sess-1';
      jwtService.verifyAsync.mockResolvedValue({ sub: mockUserWithRoles.id, jti });
      refreshTokenRepository.findByJti.mockResolvedValue({ jti, sessionId, revokedAt: null } as any);
      userRepository.findById.mockResolvedValue(mockUserWithRoles);
      // @ts-expect-error - private method
      jest.spyOn(service, 'generateTokens').mockResolvedValue({ accessToken: 'new-at', refreshToken: 'new-rt' });

      const result = await service.refreshToken('rt');
      expect(refreshTokenRepository.revoke).toHaveBeenCalledWith(jti);
      expect(result).toEqual({ accessToken: 'new-at', refreshToken: 'new-rt' });
    });

    it('logout revokes existing session when found', async () => {
      sessionRepository.findById.mockResolvedValue({ id: 's1', userId: mockUserWithRoles.id } as any);
      await expect(service.logout('s1')).resolves.toBeUndefined();
      expect(sessionRepository.delete).toHaveBeenCalledWith('s1');
    });

    it('listSessions returns sessions', async () => {
      sessionRepository.findByUserId.mockResolvedValue([{ id: 's1' }] as any);
      const res = await service.listSessions('u1');
      expect(res).toEqual([{ id: 's1' }]);
    });

    it('revokeSession validates owner and deletes', async () => {
      sessionRepository.findById.mockResolvedValue({ id: 's1', userId: 'u1' } as any);
      const res = await service.revokeSession('u1', 's1');
      expect(sessionRepository.delete).toHaveBeenCalledWith('s1');
      expect(res).toEqual({ success: true });
    });

    it('revokeSession throws when owner mismatch or missing', async () => {
      sessionRepository.findById.mockResolvedValue({ id: 's1', userId: 'other' } as any);
      await expect(service.revokeSession('u1', 's1')).rejects.toThrow(UnauthorizedException);
    });

    it('refreshToken throws on invalid token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('bad'));
      await expect(service.refreshToken('rt')).rejects.toThrow(UnauthorizedException);
    });

    it('refreshToken throws when stored token missing or revoked', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'u1', jti: 'x' });
      refreshTokenRepository.findByJti.mockResolvedValue({ jti: 'x', revokedAt: new Date(), sessionId: 's1' } as any);
      await expect(service.refreshToken('rt')).rejects.toThrow(UnauthorizedException);
    });

    it('refreshToken throws when user not found', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'u1', jti: 'x' });
      refreshTokenRepository.findByJti.mockResolvedValue({ jti: 'x', revokedAt: null, sessionId: 's1' } as any);
      userRepository.findById.mockResolvedValue(null as any);
      await expect(service.refreshToken('rt')).rejects.toThrow(UnauthorizedException);
    });

    it('logout no-ops if session not found', async () => {
      sessionRepository.findById.mockResolvedValue(null as any);
      await expect(service.logout('missing')).resolves.toBeUndefined();
      expect(sessionRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('email & verification branches', () => {
    it('requestPasswordReset no-ops when user missing', async () => {
      userRepository.findByEmail.mockResolvedValue(null as any);
      await expect(service.requestPasswordReset('no@user')).resolves.toBeUndefined();
      expect(emailPort.sendMail).not.toHaveBeenCalled();
    });

    it('requestEmailVerification no-ops when user missing', async () => {
      userRepository.findByEmail.mockResolvedValue(null as any);
      await expect(service.requestEmailVerification('none@example.com')).resolves.toBeUndefined();
    });

    it('requestEmailVerification no-ops when already verified', async () => {
      userRepository.findByEmail.mockResolvedValue({ ...mockUserWithRoles, emailVerifiedAt: new Date() });
      await expect(service.requestEmailVerification('v@example.com')).resolves.toBeUndefined();
    });

    it('verifyEmail throws on invalid token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('bad'));
      await expect(service.verifyEmail('bad')).rejects.toThrow(UnauthorizedException);
    });

    it('signInWithTotp throws when user not found after verify', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'nope', aud: 'totp' });
      totpService.verifyToken.mockResolvedValue(true);
      userRepository.findById.mockResolvedValue(null as any);
      await expect(service.signInWithTotp('temp', '123456')).rejects.toThrow(UnauthorizedException);
    });

    it('issueTokensForUser throws for missing user', async () => {
      userRepository.findById.mockResolvedValue(null as any);
      await expect(service.issueTokensForUser('x')).rejects.toThrow(UnauthorizedException);
    });

    it('issueTokensForUser returns tokens for existing user', async () => {
      const withRole = { ...mockUserWithRoles, roles: [{ role: { name: 'admin' } }] as any } as typeof mockUserWithRoles;
      userRepository.findById.mockResolvedValue(withRole);
      sessionRepository.create.mockResolvedValue({ id: 'sess' } as any);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      refreshTokenRepository.create.mockResolvedValue({} as any);
      const result = await service.issueTokensForUser(withRole.id);
      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    });

    it('signIn without TOTP generates tokens via generateTokens', async () => {
      const withRole = { ...mockUserWithRoles, roles: [{ role: { name: 'user' } }] as any } as typeof mockUserWithRoles;
      userRepository.findByEmail.mockResolvedValue(withRole);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      credentialTotpRepository.findByUserId.mockResolvedValue(null);
      sessionRepository.create.mockResolvedValue({ id: 'sess' } as any);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      refreshTokenRepository.create.mockResolvedValue({} as any);
      const res = await service.signIn('test@example.com', 'password');
      expect(res).toEqual({ totpRequired: false, accessToken: 'access-token', refreshToken: 'refresh-token' });
    });
  });
});
