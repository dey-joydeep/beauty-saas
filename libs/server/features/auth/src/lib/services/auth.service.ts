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
import { PASSWORD_RESET_REPOSITORY, IPasswordResetRepository } from '@cthub-bsaas/server-contracts-auth';
import { EMAIL_VERIFICATION_REPOSITORY, IEmailVerificationRepository } from '@cthub-bsaas/server-contracts-auth';
import { AuditService } from './audit.service';
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
    @Inject(EMAIL_VERIFICATION_REPOSITORY) private readonly emailVerRepo: IEmailVerificationRepository,
    @Inject(PASSWORD_RESET_REPOSITORY) private readonly pwdResetRepo: IPasswordResetRepository,
    private readonly audit: AuditService,
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
      throw new UnauthorizedException('error.auth.invalid_credentials');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('error.auth.invalid_credentials');
    }

    const totpCredential = await this.credentialTotpRepository.findByUserId(user.id);
    if (totpCredential && totpCredential.verified) {
      const tempToken = await this.jwtService.signAsync(
        { sub: user.id, aud: 'totp' },
        {
          secret:
            this.configService.get<string>('JWT_ACCESS_SECRET') ||
            this.configService.get<string>('JWT_SECRET') ||
            'test-access-secret',
          expiresIn: '5m',
        },
      );
      this.audit.log('login_password_totp_challenge', { userId: user.id });
      return { totpRequired: true, tempToken };
    }

    const session = await this.sessionRepository.create({ userId: user.id });
    const { accessToken, refreshToken } = await this.generateTokens(user, session.id);

    this.audit.log('login_password_success', { userId: user.id, sessionId: session.id });
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
        throw new UnauthorizedException('error.auth.invalid_totp_token');
      }

      const isTotpValid = await this.totpService.verifyToken(sub, totpCode);
      if (!isTotpValid) {
        throw new UnauthorizedException('error.auth.invalid_totp_code');
      }

      const user = await this.userRepository.findById(sub);
      if (!user) {
        throw new UnauthorizedException('error.auth.user_not_found');
      }

      const session = await this.sessionRepository.create({ userId: user.id });
      const tokens = await this.generateTokens(user, session.id);
      this.audit.log('login_totp_success', { userId: user.id, sessionId: session.id });
      return tokens;
    } catch {
      throw new UnauthorizedException('error.auth.invalid_or_expired_totp');
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
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          this.configService.get<string>('JWT_SECRET') ||
          'test-refresh-secret',
      });

      const storedToken = await this.refreshTokenRepository.findByJti(jti);
      if (!storedToken || storedToken.revokedAt) {
        throw new UnauthorizedException('error.auth.invalid_refresh_token');
      }

      const user = await this.userRepository.findById(sub);
      if (!user) {
        throw new UnauthorizedException('error.auth.user_not_found');
      }

      // Invalidate the old refresh token
      await this.refreshTokenRepository.revoke(jti);

      const tokens = await this.generateTokens(user, storedToken.sessionId);
      this.audit.log('refresh_success', { userId: user.id, sessionId: storedToken.sessionId });
      return tokens;
    } catch {
      throw new UnauthorizedException('error.auth.invalid_refresh_token');
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
      this.audit.log('logout', { userId: session.userId, sessionId });
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
      throw new UnauthorizedException('error.auth.cannot_revoke_session');
    }
    await this.sessionRepository.delete(sessionId);
    this.audit.log('session_revoked', { userId, sessionId });
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
          secret:
            this.configService.get<string>('JWT_ACCESS_SECRET') ||
            this.configService.get<string>('JWT_SECRET') ||
            'test-access-secret',
          expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
        },
      ),
      this.jwtService.signAsync(
        { sub: user.id, jti },
        {
          secret:
            this.configService.get<string>('JWT_REFRESH_SECRET') ||
            this.configService.get<string>('JWT_SECRET') ||
            'test-refresh-secret',
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
        },
      ),
    ]);

    await this.refreshTokenRepository.create({ jti, userId: user.id, sessionId });

    return { accessToken, refreshToken };
  }

  /**
   * Issue tokens for an existing user by id (used after WebAuthn login).
   *
   * @public
   * @param {string} userId - User id to authenticate.
   * @returns {Promise<TokenPair>} New token pair bound to a new session.
   */
  public async issueTokensForUser(userId: string): Promise<TokenPair> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedException('error.auth.user_not_found');
    const session = await this.sessionRepository.create({ userId: user.id });
    return this.generateTokens(user, session.id);
  }

  /**
   * Resolve a user's id by email, used for unauthenticated WebAuthn start.
   * @public
   * @param {string} email target email address
   * @returns {Promise<string>} user id when found
   */
  public async resolveUserIdByEmail(email: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedException('error.auth.user_not_found');
    return user.id;
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
    const id = randomUUID();
    const secret = randomUUID().replace(/-/g, '');
    const tokenHash = await bcrypt.hash(secret, 10);
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72h
    await this.pwdResetRepo.create({ id, userId: user.id, tokenHash, expiresAt });
    const token = `${id}.${secret}`;
    await this.emailPort.sendMail(user.email, 'Password Reset', `Use this token to reset your password: ${token}`);
    this.audit.log('password_reset_requested', { userId: user.id });
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
    const [id, providedSecret] = token.split('.', 2);
    if (!id || !providedSecret) throw new UnauthorizedException('error.auth.invalid_or_expired_reset_token');
    const rec = await this.pwdResetRepo.findById(id);
    if (!rec || rec.usedAt || rec.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('error.auth.invalid_or_expired_reset_token');
    }
    const ok = await bcrypt.compare(providedSecret, rec.tokenHash);
    if (!ok) throw new UnauthorizedException('error.auth.invalid_or_expired_reset_token');
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(rec.userId, { passwordHash } as Partial<User>);
    await this.pwdResetRepo.markUsed(rec.id);
    // Revoke all sessions for this user after reset
    const sessions = (await this.sessionRepository.findByUserId(rec.userId)) as { id: string }[];
    for (const s of sessions) {
      await this.sessionRepository.delete(s.id);
    }
    this.audit.log('password_reset_confirmed', { userId: rec.userId, revokedSessions: sessions.length });
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
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString(); // 6 digits
    const codeHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await this.emailVerRepo.upsertForEmail(user.email, codeHash, expiresAt);
    await this.emailPort.sendMail(
      user.email,
      'Verify your email',
      `Your verification code is: ${otp}. It expires in 10 minutes.`,
    );
    this.audit.log('email_verification_requested', { userId: user.id });
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
      if (aud !== 'verify') throw new UnauthorizedException('error.auth.invalid_verify_token');
      await this.userRepository.update(sub, { emailVerifiedAt: new Date() } as Partial<User>);
      this.audit.log('email_verified', { userId: sub });
    } catch {
      throw new UnauthorizedException('error.auth.invalid_or_expired_verify_token');
    }
  }

  /**
   * Verify email via OTP code (DB-backed).
   * @param email target email
   * @param otp 6-digit string
   */
  public async verifyEmailOtp(email: string, otp: string): Promise<void> {
    const rec = await this.emailVerRepo.findActiveByEmail(email);
    if (!rec) throw new UnauthorizedException('error.auth.otp_expired');
    await this.emailVerRepo.incrementAttempts(rec.id);
    const ok = await bcrypt.compare(otp, rec.codeHash);
    if (!ok) throw new UnauthorizedException('error.auth.invalid_otp');
    await this.emailVerRepo.markUsed(rec.id);
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedException('error.auth.user_not_found');
    await this.userRepository.update(user.id, { emailVerifiedAt: new Date() } as Partial<User>);
    this.audit.log('email_verified', { userId: user.id });
  }
}
