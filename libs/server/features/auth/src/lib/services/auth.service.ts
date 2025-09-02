import {
  CREDENTIAL_TOTP_REPOSITORY,
  ICredentialTotpRepository,
  IRefreshTokenRepository,
  ISessionRepository,
  IUserRepository,
  REFRESH_TOKEN_REPOSITORY,
  SESSION_REPOSITORY,
  USER_REPOSITORY,
} from '@cthub-bsaas/server-contracts-auth';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TOTP_PORT, TotpPort, EMAIL_PORT, EmailPort } from '@cthub-bsaas/server-contracts-auth';
import type { AuthSignInResult, TokenPair } from '../types/auth.types';

import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

/**
 * @public
 * Domain service responsible for authentication flows, sessions, refresh token rotation
 * and multi-factor enrollment and verification.
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(SESSION_REPOSITORY) private readonly sessionRepository: ISessionRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(CREDENTIAL_TOTP_REPOSITORY) private readonly credentialTotpRepository: ICredentialTotpRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(TOTP_PORT) private readonly totpService: TotpPort,
    @Inject(EMAIL_PORT) private readonly emailPort: EmailPort,
  ) {}

    /**
     * Sign in with email/password. If TOTP is enabled, returns a temp token for second factor.
     *
     * @public
     * @param {string} email - User email.
     * @param {string} pass - Plain text password.
     * @returns {Promise<{ totpRequired: boolean; tempToken?: string; accessToken?: string; refreshToken?: string }>} Token payload or TOTP challenge.
     */
    public async signIn(email: string, pass: string): Promise<AuthSignInResult> {
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

  /**
   * Complete a TOTP challenge using a temp token.
   *
   * @public
   * @param {string} tempToken - JWT issued after password validation.
   * @param {string} totpCode - The 6-digit TOTP code.
   * @returns {Promise<{ accessToken: string; refreshToken: string }>} New token pair.
   */
  public async signInWithTotp(tempToken: string, totpCode: string): Promise<TokenPair> {
    try {
      const { sub, aud } = await this.jwtService.verifyAsync<{ sub: string; aud: string }>(tempToken, {
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
    } catch {
      throw new UnauthorizedException('Invalid or expired TOTP session');
    }
  }

  /**
   * Validate and rotate a refresh token, issuing a new access token and refresh token.
   *
   * @public
   * @param {string} token - The refresh token (from cookie or body).
   * @returns {Promise<{ accessToken: string; refreshToken: string }>} Rotated tokens.
   */
  public async refreshToken(token: string): Promise<TokenPair | null> {
    try {
      const { sub, jti } = await this.jwtService.verifyAsync<{ sub: string; jti: string }>(token, {
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
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Revoke the provided session id.
   *
   * @public
   * @param {string} sessionId - Session id to revoke.
   * @returns {Promise<void>} Resolves after revocation.
   */
  public async logout(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (session) {
      await this.sessionRepository.delete(sessionId);
    }
  }

  /**
   * List active sessions for a user.
   *
   * @public
   * @param {string} userId - User id whose sessions to list.
   * @returns {Promise<unknown>} Array of sessions.
   */
  public async listSessions(userId: string): Promise<unknown> {
    return this.sessionRepository.findByUserId(userId);
  }

  /**
   * Revoke a specific session owned by the user.
   *
   * @public
   * @param {string} userId - Owner user id.
   * @param {string} sessionId - Session id to revoke.
   * @returns {Promise<{ success: true }>} Success response.
   */
  public async revokeSession(userId: string, sessionId: string): Promise<{ success: true }> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session || session.userId !== userId) {
      throw new UnauthorizedException('Cannot revoke this session');
    }
    await this.sessionRepository.delete(sessionId);
    return { success: true };
  }

  /**
   * Generate an access/refresh token pair and persist the refresh token metadata.
   *
   * @private
   * @param {User & { roles: { role: { name: string } }[] }} user - Authenticated user with roles.
   * @param {string} sessionId - Active session id.
   * @returns {Promise<{ accessToken: string; refreshToken: string }>} Signed tokens.
   */
  private async generateTokens(
    user: User & { roles: { role: { name: string } }[] },
    sessionId: string,
  ): Promise<TokenPair> {
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

  // Account recovery: password reset
  /**
   * Send a one-time password reset token to the provided email.
   *
   * @public
   * @param {string} email - Target email address.
   * @returns {Promise<void>} Resolves once the message is queued.
   */
  public async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return; // Avoid account enumeration
    const resetSecret = this.configService.get<string>('JWT_RESET_SECRET') || this.configService.get<string>('JWT_ACCESS_SECRET')!;
    const token = await this.jwtService.signAsync(
      { sub: user.id, aud: 'reset' },
      {
        secret: resetSecret,
        expiresIn: '15m',
      },
    );
    await this.emailPort.sendMail(user.email, 'Password Reset', `Use this token to reset your password: ${token}`);
  }

  /**
   * Reset a user's password using a valid reset token.
   *
   * @public
   * @param {string} token - Password reset token.
   * @param {string} newPassword - New plain text password.
   * @returns {Promise<void>} Resolves after updating the password hash.
   */
  public async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const resetSecret = this.configService.get<string>('JWT_RESET_SECRET') || this.configService.get<string>('JWT_ACCESS_SECRET')!;
        const { sub, aud } = await this.jwtService.verifyAsync<{ sub: string; aud: string }>(token, {
          secret: resetSecret,
        });
      if (aud !== 'reset') throw new UnauthorizedException('Invalid token');
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await this.userRepository.update(sub, { passwordHash } as Partial<User>);
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  // Email verification
  /**
   * Send an email verification token to a user (no-op if already verified).
   *
   * @public
   * @param {string} email - Target email address.
   * @returns {Promise<void>} Resolves once the message is queued.
   */
  public async requestEmailVerification(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || user.emailVerifiedAt) return;
    const verifySecret = this.configService.get<string>('JWT_VERIFY_EMAIL_SECRET') || this.configService.get<string>('JWT_ACCESS_SECRET')!;
    const token = await this.jwtService.signAsync(
      { sub: user.id, aud: 'verify' },
      {
        secret: verifySecret,
        expiresIn: '24h',
      },
    );
    await this.emailPort.sendMail(user.email, 'Verify your email', `Use this token to verify your email: ${token}`);
  }

  /**
   * Verify a user's email address using a verification token.
   *
   * @public
   * @param {string} token - Verification token.
   * @returns {Promise<void>} Resolves after marking the email as verified.
   */
  public async verifyEmail(token: string): Promise<void> {
    try {
      const verifySecret = this.configService.get<string>('JWT_VERIFY_EMAIL_SECRET') || this.configService.get<string>('JWT_ACCESS_SECRET')!;
      const { sub, aud } = await this.jwtService.verifyAsync<{ sub: string; aud: string }>(token, {
        secret: verifySecret,
      });
      if (aud !== 'verify') throw new UnauthorizedException('Invalid token');
      await this.userRepository.update(sub, { emailVerifiedAt: new Date() } as Partial<User>);
    } catch {
      throw new UnauthorizedException('Invalid or expired verification token');
    }
  }
}
