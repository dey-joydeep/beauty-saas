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
} from '@cthub-bsaas/server-contracts-auth';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailModule, TotpModule, WebAuthnModule, RecoveryModule } from '@cthub-bsaas/server-infrastructure';

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

/**
 * @public
 * Authentication feature module providing controllers, services and strategies
 * for sign-in, session management and MFA.
 */
@Module({
  imports: [
    PrismaModule,
    EncryptionModule,
    TotpModule,
    WebAuthnModule,
    RecoveryModule,
    EmailModule,
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
  ],
  controllers: [AuthController, TotpController],
    providers: [AuthService, JwtStrategy, ...providers],
  exports: [AuthService, ...providers],
})
export class AuthModule {}

