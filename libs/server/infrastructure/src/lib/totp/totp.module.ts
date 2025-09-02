import { EncryptionModule } from '@cthub-bsaas/server-core';
import { PrismaModule } from '@cthub-bsaas/server-data-access';
import { TOTP_PORT } from '@cthub-bsaas/server-contracts-auth';
import { Module } from '@nestjs/common';
import { TotpOtplibAdapter } from './totp.otplib.adapter';

/**
 * @public
 * Infrastructure module that registers the TOTP adapter implementation.
 */
@Module({
    imports: [PrismaModule, EncryptionModule],
    providers: [
        {
            provide: TOTP_PORT,
            useClass: TotpOtplibAdapter,
        },
    ],
    exports: [TOTP_PORT],
})
export class TotpModule {}
