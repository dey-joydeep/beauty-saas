import { Public } from '@cthub-bsaas/server-core';
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Request, Res, Get, Param, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '@cthub-bsaas/server-core';
import { AuthService } from '../services/auth.service';
import { SkipCsrf } from '@cthub-bsaas/server-core';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { TotpLoginDto } from '../dto/totp-login.dto';
import type { Response, Request as ExpressRequest } from 'express';
import { Query } from '@nestjs/common';
import type { SignInHttpResponse, SimpleOk } from '../types/auth.types';
import { WEB_AUTHN_PORT, RECOVERY_CODES_PORT, WebAuthnPort, RecoveryCodesPort, OAUTH_PORT, OAuthPort } from '@cthub-bsaas/server-contracts-auth';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
// Public decorator is already imported at file top

/**
 * @public
 * Authentication controller exposing login, refresh, logout, sessions
 * and account recovery endpoints.
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(WEB_AUTHN_PORT) private readonly webAuthn: WebAuthnPort,
    @Inject(RECOVERY_CODES_PORT) private readonly recovery: RecoveryCodesPort,
    @Inject(OAUTH_PORT) private readonly oauth: OAuthPort,
    private readonly config: ConfigService,
  ) {}

  /**
   * Sign in with email and password. If TOTP is enabled, returns a temp token.
   * Sets refresh token cookie on successful non-TOTP login.
   *
   * @public
   * @param {LoginDto} signInDto - Credentials payload.
   * @param {Response} res - Express response for setting cookies.
   * @returns {Promise<{ totpRequired: boolean; tempToken?: string; accessToken?: string }>} Token response.
   */
  @Public()
  @SkipCsrf()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: LoginDto, @Res({ passthrough: true }) res: Response): Promise<SignInHttpResponse> {
    const result = await this.authService.signIn(signInDto.email, signInDto.password);
    const domain = this.config.get<string>('AUTH_COOKIE_DOMAIN');
    // Set CSRF token cookie for subsequent state-changing requests
    const csrf = (Math.random().toString(36) + Math.random().toString(36)).slice(2);
    res.cookie('XSRF-TOKEN', csrf, { httpOnly: false, secure: true, sameSite: 'lax', path: '/', domain });
    if (!result.totpRequired) {
      // Set cookies: access and refresh tokens
      res.cookie('bsaas_at', result.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        domain,
      });
      res.cookie('bsaas_rt', result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/auth',
        domain,
      });
    }
    // Return minimal public payload; tokens are cookie-only
    return result.totpRequired ? { totpRequired: true, tempToken: result.tempToken } : { totpRequired: false };
  }

  /**
   * Rotate refresh token and issue a new access token.
   *
   * @public
   * @param {RefreshTokenDto} refreshTokenDto - Optional body token if cookie is absent.
   * @param {ExpressRequest} req - Express request for reading cookies.
   * @param {Response} res - Express response for updating cookies.
   * @returns {Promise<{ accessToken: string | undefined }>} New access token, if valid.
   */
  @Public()
  @SkipCsrf()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, never>> {
    const cookieHeader = req.headers['cookie'];
    let tokenFromCookie: string | undefined;
    if (typeof cookieHeader === 'string') {
      for (const part of cookieHeader.split(';')) {
        const [k, v] = part.trim().split('=');
        if (k === 'bsaas_rt' || k === 'refreshToken') {
          tokenFromCookie = v ? decodeURIComponent(v) : decodeURIComponent('');
          break;
        }
      }
    }
    const token = tokenFromCookie ?? refreshTokenDto.refreshToken;
    if (!token) {
      throw new BadRequestException('error.auth.missing_refresh_token');
    }
    const result = await this.authService.refreshToken(token);
    const domain = this.config.get<string>('AUTH_COOKIE_DOMAIN');
    if (result?.refreshToken) {
      res.cookie('bsaas_rt', result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/auth',
        domain,
      });
      res.cookie('bsaas_at', result.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        domain,
      });
    }
    // rotate CSRF token as well
    const csrf = (Math.random().toString(36) + Math.random().toString(36)).slice(2);
    res.cookie('XSRF-TOKEN', csrf, { httpOnly: false, secure: true, sameSite: 'lax', path: '/', domain });
    return {} as const;
  }

  /**
   * Logout and revoke the current session. Clears refresh token cookie.
   *
   * @public
   * @param {{ user: { sessionId: string } }} req - Request containing current session id.
   * @param {Response} res - Express response used to clear cookie.
   * @returns {Promise<{ success: true }>} Success response.
   */
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Post('logout')
  async logout(@Request() req: { user: { sessionId: string } }, @Res({ passthrough: true }) res: Response): Promise<SimpleOk> {
    await this.authService.logout(req.user.sessionId);
    const domain = this.config.get<string>('AUTH_COOKIE_DOMAIN');
    res.clearCookie('bsaas_rt', { path: '/auth', domain });
    res.clearCookie('bsaas_at', { path: '/', domain });
    return { success: true };
  }

  /**
   * List active sessions for the authenticated user.
   *
   * @public
   * @param {{ user: { userId: string } }} req - Request containing user id.
   * @returns {Promise<unknown>} Array of sessions from the repository.
   */
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async listSessions(@Request() req: { user: { userId: string } }): Promise<unknown> {
    return this.authService.listSessions(req.user.userId);
  }

  /**
   * Revoke a specific session owned by the authenticated user.
   *
   * @public
   * @param {{ user: { userId: string } }} req - Request containing user id.
   * @param {string} id - Session id to revoke.
   * @returns {Promise<{ success: true }>} Success response.
   */
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Post('sessions/revoke/:id')
  async revokeSession(@Request() req: { user: { userId: string } }, @Param('id') id: string): Promise<SimpleOk> {
    return this.authService.revokeSession(req.user.userId, id);
  }

  /**
   * Complete TOTP challenge with a temp token and code.
   *
   * @public
   * @param {TotpLoginDto} signInWithTotpDto - TOTP challenge payload.
   * @returns {Promise<{ accessToken: string; refreshToken: string }>} New token pair.
   */
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @HttpCode(HttpStatus.OK)
  @Post('login/totp')
  async signInWithTotp(@Body() signInWithTotpDto: TotpLoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.signInWithTotp(signInWithTotpDto.tempToken, signInWithTotpDto.totpCode);
    const domain = this.config.get<string>('AUTH_COOKIE_DOMAIN');
    res.cookie('bsaas_at', tokens.accessToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', domain });
    res.cookie('bsaas_rt', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/auth', domain });
    return {} as const;
  }

  // Account recovery endpoints
  /**
   * Request a password reset email (no account enumeration).
   *
   * @public
   * @param {{ email: string }} body - Email address for the account.
   * @returns {Promise<{ success: true }>} Accepted response.
   */
  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('password/forgot')
  @SkipCsrf()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async forgotPassword(@Body() body: { email: string }): Promise<SimpleOk> {
    await this.authService.requestPasswordReset(body.email);
    return { success: true };
  }

  /**
   * Reset password using a one-time token.
   *
   * @public
   * @param {{ token: string; newPassword: string }} body - Reset token and new password.
   * @returns {Promise<{ success: true }>} OK response after update.
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('password/reset')
  @SkipCsrf()
  @Throttle({ default: { limit: 3, ttl: 60 } })
  async resetPassword(@Body() body: { token: string; newPassword: string }): Promise<SimpleOk> {
    await this.authService.resetPassword(body.token, body.newPassword);
    return { success: true };
  }

  /**
   * Send an email verification token to a user.
   *
   * @public
   * @param {{ email: string }} body - Target email address.
   * @returns {Promise<{ success: true }>} Accepted response.
   */
  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('email/send-verification')
  @SkipCsrf()
  @Throttle({ default: { limit: 3, ttl: 60 } })
  async sendEmailVerification(@Body() body: { email: string }): Promise<SimpleOk> {
    await this.authService.requestEmailVerification(body.email);
    return { success: true };
  }

  /**
   * Verify an email address using a token.
   *
   * @public
   * @param {{ token: string }} body - Verification token.
   * @returns {Promise<{ success: true }>} OK response after verification.
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('email/verify')
  @SkipCsrf()
  async verifyEmail(@Body() body: { token: string }): Promise<SimpleOk> {
    await this.authService.verifyEmail(body.token);
    return { success: true };
  }

  // Spec-aligned email verify routes (current implementation uses token under the hood)
  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('email/verify/request')
  @SkipCsrf()
  @Throttle({ default: { limit: 3, ttl: 60 } })
  async emailVerifyRequest(@Body() body: { email: string }): Promise<SimpleOk> {
    await this.authService.requestEmailVerification(body.email);
    return { success: true };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('email/verify/confirm')
  @SkipCsrf()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async emailVerifyConfirm(@Body() body: { token?: string; email?: string; otp?: string }): Promise<SimpleOk> {
    if (body.token) {
      await this.authService.verifyEmail(body.token);
      return { success: true };
    }
    if (body.email && body.otp) {
      await this.authService.verifyEmailOtp(body.email, body.otp);
      return { success: true };
    }
    throw new BadRequestException('error.validation');
  }

  /**
   * Start WebAuthn registration by returning creation options.
   * @public
   * @param {{ username: string }} body - Display name/username for credential.
   * @param {{ user: { userId: string } }} req - Request with current user id.
   * @returns {Promise<Record<string, unknown>>} Creation options JSON.
   */
  @UseGuards(JwtAuthGuard)
  @Post('webauthn/register/start')
  async webauthnRegisterStart(@Body() body: { username: string }, @Request() req: { user: { userId: string } }): Promise<Record<string, unknown>> {
    return this.webAuthn.startRegistration(req.user.userId, body.username);
  }

  /**
   * Finish WebAuthn registration by verifying attestation.
   * @public
   * @param {Record<string, unknown>} response - Attestation response.
   * @param {{ user: { userId: string } }} req - Request with current user id.
   * @returns {Promise<SimpleOk>} Success on valid registration.
   */
  @UseGuards(JwtAuthGuard)
  @Post('webauthn/register/finish')
  async webauthnRegisterFinish(@Body() response: Record<string, unknown>, @Request() req: { user: { userId: string } }): Promise<SimpleOk> {
    await this.webAuthn.finishRegistration(req.user.userId, response);
    return { success: true };
  }

  /**
   * Start WebAuthn login by returning request options.
   * @public
   * @param {{ email?: string }} body - Optional lookup; defaults to current user if authenticated.
   * @param {{ user?: { userId: string } }} req - Optional user context.
   * @returns {Promise<Record<string, unknown>>} Request options JSON.
   */
  @Public()
  @Post('webauthn/login/start')
  @SkipCsrf()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async webauthnLoginStart(
    @Body() body: { email?: string; userId?: string } = {},
    @Request() req: { user?: { userId: string } } = {},
  ): Promise<Record<string, unknown>> {
    // Allow unauthenticated start by identity (email or userId). Fallback to authenticated user if present.
    const providedUserId = req.user?.userId ?? body.userId;
    const userId = providedUserId ?? (body.email ? await this.authService.resolveUserIdByEmail(body.email) : undefined);
    if (!userId) {
      throw new BadRequestException('error.validation');
    }
    return this.webAuthn.startAuthentication(userId);
  }

  /**
   * Finish WebAuthn login by verifying assertion and issuing tokens.
   * @public
   * @param {Record<string, unknown>} response - Assertion response.
   * @param {{ user: { userId: string } }} req - Request with user context.
   * @param {Response} res - Express response to set cookie.
   * @returns {Promise<{ accessToken: string }>} Access token.
   */
  @Public()
  @Post('webauthn/login/finish')
  @SkipCsrf()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async webauthnLoginFinish(
    @Body() response: Record<string, unknown>,
    @Request() req: { user: { userId: string } },
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, never>> {
    await this.webAuthn.finishAuthentication(req.user.userId, response);
    // Issue session + tokens
    const result = await this.authService.issueTokensForUser(req.user.userId);
    const domain = this.config.get<string>('AUTH_COOKIE_DOMAIN');
    res.cookie('bsaas_at', result.accessToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', domain });
    res.cookie('bsaas_rt', result.refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/auth', domain });
    return {} as const;
  }

  /**
   * Generate recovery codes for the current user.
   * @public
   * @returns {Promise<string[]>} Plain-text recovery codes (store securely client-side).
   */
  @UseGuards(JwtAuthGuard)
  @Post('recovery/generate')
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  async generateRecovery(@Request() req: { user: { userId: string } }): Promise<string[]> {
    return this.recovery.generate(req.user.userId, 10);
  }

  /**
   * Alias for recovery codes generation per spec: POST /auth/recovery/codes
   * @public
   * @returns {Promise<string[]>} Plain-text recovery codes.
   */
  @UseGuards(JwtAuthGuard)
  @Post('recovery/codes')
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  async generateRecoveryCodes(@Request() req: { user: { userId: string } }): Promise<string[]> {
    return this.recovery.generate(req.user.userId, 10);
  }

  /**
   * Verify and consume a recovery code for the current user.
   * @public
   * @param {{ code: string }} body - Recovery code.
   * @returns {Promise<SimpleOk>} Success when valid.
   */
  @UseGuards(JwtAuthGuard)
  @Post('recovery/verify')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async verifyRecovery(@Body() body: { code: string }, @Request() req: { user: { userId: string } }): Promise<SimpleOk> {
    const ok = await this.recovery.verifyAndConsume(req.user.userId, body.code);
    if (!ok) throw new Error('Invalid recovery code');
    return { success: true };
  }

  // Body-based session revoke endpoint (alias without path param)
  @UseGuards(JwtAuthGuard)
  @Post('sessions/revoke')
  async revokeSessionBody(@Request() req: { user: { userId: string } }, @Body() body: { id: string }): Promise<SimpleOk> {
    return this.authService.revokeSession(req.user.userId, body.id);
  }

  // Registration placeholder endpoint
  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('register')
  @SkipCsrf()
  registerPlaceholder(): SimpleOk {
    return { success: true };
  }

  /**
   * Begin OAuth flow: returns a 302 redirect to the provider authorization URL.
   * @public
   */
  @Public()
  @Get('oauth/:provider/start')
  @SkipCsrf()
  async oauthStart(@Param('provider') provider: string, @Res() res: Response): Promise<void> {
    const { redirectUrl } = await this.oauth.start(provider);
    res.status(HttpStatus.FOUND).setHeader('Location', redirectUrl).end();
  }

  /**
   * OAuth callback: exchange code and sign-in or link.
   */
  @Public()
  @Get('oauth/:provider/callback')
  @SkipCsrf()
  async oauthCallback(
    @Param('provider') provider: string,
    @Request() req: { user?: { userId: string } },
    @Res({ passthrough: true }) res: Response,
    @Query('code') code?: string,
    @Query('state') state?: string,
  ): Promise<Record<string, never>> {
    if (!code) {
      throw new BadRequestException('error.validation');
    }
    const profile = await this.oauth.exchangeCode(provider, code, state);
    if (req.user?.userId) {
      await this.authService.linkSocialAccount(req.user.userId, profile.provider, profile.providerUserId);
      return {} as const;
    }
    // sign in path
    const tokens: { accessToken: string; refreshToken: string } = await this.authService.signInWithSocial(profile);
    const domain = this.config.get<string>('AUTH_COOKIE_DOMAIN');
    res.cookie('bsaas_at', tokens.accessToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', domain });
    res.cookie('bsaas_rt', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/auth', domain });
    return {} as const;
  }

  @UseGuards(JwtAuthGuard)
  @Post('oauth/:provider/unlink')
  async oauthUnlink(@Param('provider') provider: string, @Request() req: { user: { userId: string } }): Promise<SimpleOk> {
    await this.authService.unlinkSocialAccount(req.user.userId, provider);
    return { success: true };
  }
}
