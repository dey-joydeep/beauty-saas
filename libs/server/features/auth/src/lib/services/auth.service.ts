import {
  CREDENTIAL_TOTP_REPOSITORY,
  ICredentialTotpRepository,
  IRefreshTokenRepository,
  ISessionRepository,
  IUserRepository,
  REFRESH_TOKEN_REPOSITORY,
  SESSION_REPOSITORY,
  USER_REPOSITORY,
} from '@cthub-bsaas/server-data-access';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ITotpService } from '@cthub-bsaas/server-core';

import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(SESSION_REPOSITORY) private readonly sessionRepository: ISessionRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(CREDENTIAL_TOTP_REPOSITORY) private readonly credentialTotpRepository: ICredentialTotpRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(ITotpService) private readonly totpService: ITotpService,
  ) {}

    async signIn(email: string, pass: string): Promise<{ totpRequired: boolean; tempToken?: string; accessToken?: string; refreshToken?: string; }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const totpCredential = await this.credentialTotpRepository.findByUserId(user.id);
    if (totpCredential && totpCredential.verified) {
      const tempToken = await this.jwtService.signAsync(
        { sub: user.id, aud: 'totp' },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '5m',
        },
      );
      return { totpRequired: true, tempToken };
    }

    const session = await this.sessionRepository.create({ userId: user.id });
    const { accessToken, refreshToken } = await this.generateTokens(user, session.id);

    return { totpRequired: false, accessToken, refreshToken };
  }

  async signInWithTotp(tempToken: string, totpCode: string): Promise<{ accessToken: string; refreshToken: string; }> {
    try {
      const { sub, aud } = await this.jwtService.verifyAsync(tempToken, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      if (aud !== 'totp') {
        throw new UnauthorizedException('Invalid token for TOTP verification');
      }

      const isTotpValid = await this.totpService.verifyToken(sub, totpCode);
      if (!isTotpValid) {
        throw new UnauthorizedException('Invalid TOTP code');
      }

      const user = await this.userRepository.findById(sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const session = await this.sessionRepository.create({ userId: user.id });
      return this.generateTokens(user, session.id);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired TOTP session');
    }
  }

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const { sub, jti } = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const storedToken = await this.refreshTokenRepository.findByJti(jti);
      if (!storedToken || storedToken.revokedAt) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.userRepository.findById(sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Invalidate the old refresh token
      await this.refreshTokenRepository.revoke(jti);

      return this.generateTokens(user, storedToken.sessionId);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (session) {
      await this.sessionRepository.delete(sessionId);
    }
  }

  private async generateTokens(
    user: User & { roles: { role: { name: string } }[] },
    sessionId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const jti = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          sessionId,
          roles: user.roles.map(
            (userRole: { role: { name: string } }) => userRole.role.name,
          ),
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
        },
      ),
      this.jwtService.signAsync(
        { sub: user.id, jti },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
        },
      ),
    ]);

    await this.refreshTokenRepository.create({ jti, userId: user.id, sessionId });

    return { accessToken, refreshToken };
  }
}
