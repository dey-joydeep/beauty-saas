import { Public } from '@cthub-bsaas/server-core';
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';
import { SignInDto } from '../dto/sign-in.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { SignInWithTotpDto } from '../dto/sign-in-with-totp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req: { user: { sessionId: string } }) {
    return this.authService.logout(req.user.sessionId);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('sign-in/totp')
  async signInWithTotp(@Body() signInWithTotpDto: SignInWithTotpDto) {
    return this.authService.signInWithTotp(signInWithTotpDto.tempToken, signInWithTotpDto.totpCode);
  }
}
