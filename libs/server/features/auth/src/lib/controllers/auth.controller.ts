import { Public } from '@cthub-bsaas/server-core';
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Request, Res, Get, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';
import { SignInDto } from '../dto/sign-in.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { SignInWithTotpDto } from '../dto/sign-in-with-totp.dto';
import type { Response, Request as ExpressRequest } from 'express';
import type { SignInHttpResponse, SimpleOk } from '../types/auth.types';
// Public decorator is already imported at file top

/**
 * @public
 * Authentication controller exposing sign-in, refresh, logout, sessions
 * and account recovery endpoints.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Sign in with email and password. If TOTP is enabled, returns a temp token.
   * Sets refresh token cookie on successful non-TOTP login.
   *
   * @public
   * @param {SignInDto} signInDto - Credentials payload.
   * @param {Response} res - Express response for setting cookies.
   * @returns {Promise<{ totpRequired: boolean; tempToken?: string; accessToken?: string }>} Token response.
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto, @Res({ passthrough: true }) res: Response): Promise<SignInHttpResponse> {
    const result = await this.authService.signIn(signInDto.email, signInDto.password);
    if (!result.totpRequired && result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
      });
    }
    // Return minimal public payload; refresh token is cookie-only
    return result.totpRequired
      ? { totpRequired: true, tempToken: result.tempToken }
      : { totpRequired: false, accessToken: result.accessToken };
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
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string | undefined }> {
    const cookieHeader = req.headers['cookie'];
    let tokenFromCookie: string | undefined;
    if (typeof cookieHeader === 'string') {
      for (const part of cookieHeader.split(';')) {
        const [k, v] = part.trim().split('=');
        if (k === 'refreshToken') {
          tokenFromCookie = decodeURIComponent(v || '');
          break;
        }
      }
    }
    const token = tokenFromCookie ?? refreshTokenDto.refreshToken;
    if (!token) {
      throw new Error('Missing refresh token');
    }
    const result = await this.authService.refreshToken(token);
    if (result?.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
      });
    }
    return { accessToken: result?.accessToken };
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
  @Post('logout')
  async logout(@Request() req: { user: { sessionId: string } }, @Res({ passthrough: true }) res: Response): Promise<SimpleOk> {
    await this.authService.logout(req.user.sessionId);
    res.clearCookie('refreshToken', { path: '/' });
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
  @Post('sessions/revoke/:id')
  async revokeSession(@Request() req: { user: { userId: string } }, @Param('id') id: string): Promise<SimpleOk> {
    return this.authService.revokeSession(req.user.userId, id);
  }

  /**
   * Complete TOTP challenge with a temp token and code.
   *
   * @public
   * @param {SignInWithTotpDto} signInWithTotpDto - TOTP challenge payload.
   * @returns {Promise<{ accessToken: string; refreshToken: string }>} New token pair.
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('sign-in/totp')
  async signInWithTotp(@Body() signInWithTotpDto: SignInWithTotpDto) {
    return this.authService.signInWithTotp(signInWithTotpDto.tempToken, signInWithTotpDto.totpCode);
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
  async verifyEmail(@Body() body: { token: string }): Promise<SimpleOk> {
    await this.authService.verifyEmail(body.token);
    return { success: true };
  }
}
