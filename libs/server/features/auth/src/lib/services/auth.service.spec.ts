import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { mock, MockProxy } from 'jest-mock-extended';
import { User, Credential, CredentialTOTP, Session } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { CREDENTIAL_TOTP_REPOSITORY, ICredentialTotpRepository, IRefreshTokenRepository, ISessionRepository, IUserRepository, REFRESH_TOKEN_REPOSITORY, SESSION_REPOSITORY, USER_REPOSITORY } from '@cthub-bsaas/server-data-access';
import { AuthService } from './auth.service';
import { TotpService } from './totp.service';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: MockProxy<IUserRepository>;
  let sessionRepository: MockProxy<ISessionRepository>;
  let refreshTokenRepository: MockProxy<IRefreshTokenRepository>;
  let credentialTotpRepository: MockProxy<ICredentialTotpRepository>;
  let jwtService: MockProxy<JwtService>;
  let configService: MockProxy<ConfigService>;
  let totpService: MockProxy<TotpService>;

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

  beforeEach(async () => {
    userRepository = mock<IUserRepository>();
    sessionRepository = mock<ISessionRepository>();
    refreshTokenRepository = mock<IRefreshTokenRepository>();
    credentialTotpRepository = mock<ICredentialTotpRepository>();
    jwtService = mock<JwtService>();
    configService = mock<ConfigService>();
    totpService = mock<TotpService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USER_REPOSITORY, useValue: userRepository },
        { provide: SESSION_REPOSITORY, useValue: sessionRepository },
        { provide: REFRESH_TOKEN_REPOSITORY, useValue: refreshTokenRepository },
        { provide: CREDENTIAL_TOTP_REPOSITORY, useValue: credentialTotpRepository },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: TotpService, useValue: totpService },
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
      userRepository.findByEmail.mockResolvedValue(mockUser);
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
      userRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.signIn(email, password)).rejects.toThrow(UnauthorizedException);
    });

    it('should return a temporary token if TOTP is enabled', async () => {
      const totpCredential = { verified: true } as CredentialTOTP;
      userRepository.findByEmail.mockResolvedValue(mockUser);
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
      userRepository.findById.mockResolvedValue(mockUser);
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
});
