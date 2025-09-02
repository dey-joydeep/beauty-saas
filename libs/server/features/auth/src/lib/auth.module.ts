import { CredentialTotpRepository, RefreshTokenRepository, SessionRepository, UserRepository, PrismaModule } from '@cthub-bsaas/server-data-access';
import { EncryptionModule } from '@cthub-bsaas/server-core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { TotpController } from './controllers/totp.controller';
import {
  CREDENTIAL_TOTP_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
  SESSION_REPOSITORY,
  USER_REPOSITORY,
} from '@cthub-bsaas/server-data-access';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TotpModule } from '@cthub-bsaas/server-infrastructure';

const providers = [
  {
    provide: REFRESH_TOKEN_REPOSITORY,
    useClass: RefreshTokenRepository,
  },
  {
    provide: SESSION_REPOSITORY,
    useClass: SessionRepository,
  },
  {
    provide: USER_REPOSITORY,
    useClass: UserRepository,
  },
  {
    provide: CREDENTIAL_TOTP_REPOSITORY,
    useClass: CredentialTotpRepository,
  },
];

@Module({
  imports: [
    PrismaModule,
    EncryptionModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
    TotpModule,
  ],
  controllers: [AuthController, TotpController],
    providers: [AuthService, JwtStrategy, ...providers],
  exports: [AuthService, ...providers],
})
export class AuthModule {}

