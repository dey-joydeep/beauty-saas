import { EncryptionModule } from '@cthub-bsaas/server-core';
import { PrismaModule } from '@cthub-bsaas/server-data-access';
import { ITotpService } from '@cthub-bsaas/server-core';
import { Module } from '@nestjs/common';
import { TotpOtpHebAdapter } from './totp.otplib.adapter';

@Module({
    imports: [PrismaModule, EncryptionModule],
    providers: [
        {
            provide: ITotpService,
            useClass: TotpOtpHebAdapter,
        },
    ],
    exports: [ITotpService],
})
export class TotpModule {}
