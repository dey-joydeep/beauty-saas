import { Controller, Post, UseGuards, Request, Body, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '@cthub-bsaas/server-core';
import { TotpService } from '../services/totp.service';
import { VerifyTotpDto } from '../dto/verify-totp.dto';

@Controller('auth/totp')
@UseGuards(JwtAuthGuard)
export class TotpController {
  constructor(private readonly totpService: TotpService) {}

  @Post('setup')
  async setup(@Request() req: { user: { id: string } }) {
    const { qrCodeDataUrl } = await this.totpService.generateSecret(req.user.id);
    return { qrCodeDataUrl };
  }

  @Post('verify')
  async verify(@Request() req: { user: { id: string } }, @Body() verifyTotpDto: VerifyTotpDto) {
    const isVerified = await this.totpService.verifyToken(req.user.id, verifyTotpDto.token);
    if (!isVerified) {
      throw new UnauthorizedException('Invalid TOTP token');
    }
        // The service now handles marking the user as verified.
    return { success: true };
  }
}
