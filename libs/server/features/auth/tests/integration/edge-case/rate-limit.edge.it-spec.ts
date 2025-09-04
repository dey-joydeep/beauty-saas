import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule, ThrottlerException } from '@nestjs/throttler';
import { AuthController } from '../../../src/lib/controllers/auth.controller';
import { AuthService } from '../../../src/lib/services/auth.service';
import { WEB_AUTHN_PORT, RECOVERY_CODES_PORT } from '@cthub-bsaas/server-contracts-auth';
import type { WebAuthnPort, RecoveryCodesPort } from '@cthub-bsaas/server-contracts-auth';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Catch, ExceptionFilter, ArgumentsHost, HttpStatus } from '@nestjs/common';

@Catch(ThrottlerException)
class TestRetryAfterFilter implements ExceptionFilter<ThrottlerException> {
  catch(_exception: ThrottlerException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    res.setHeader('Retry-After', '1');
    res.status(HttpStatus.TOO_MANY_REQUESTS).json({ code: 'error.rate_limited' });
  }
}

describe('Rate limiting (edge-case)', () => {
  let app: INestApplication;
  let webAuthn: jest.Mocked<Pick<WebAuthnPort, 'startAuthentication'>>;
  const authSvc: jest.Mocked<Pick<AuthService, 'signIn' | 'resolveUserIdByEmail'>> = {
    signIn: jest.fn(async () => ({ totpRequired: false, accessToken: 'AT', refreshToken: 'RT' })),
    resolveUserIdByEmail: jest.fn(async () => 'user-1'),
  } as jest.Mocked<Pick<AuthService, 'signIn' | 'resolveUserIdByEmail'>>;

  beforeAll(async () => {
    webAuthn = {
      startAuthentication: jest.fn(async (userId: string) => {
        void userId;
        return { challenge: 'c' } as unknown as import('@cthub-bsaas/server-contracts-auth').RequestOptionsJSON;
      }),
    } as unknown as typeof webAuthn;
    const modRef = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({ throttlers: [{ ttl: 1, limit: 1 }] }),
      ],
      controllers: [AuthController],
      providers: [
        { provide: ConfigService, useValue: { get: () => undefined } },
        { provide: AuthService, useValue: authSvc },
        { provide: WEB_AUTHN_PORT, useValue: webAuthn },
        { provide: RECOVERY_CODES_PORT, useValue: { generate: jest.fn(async () => ['r1']), verifyAndConsume: jest.fn(async () => true) } as RecoveryCodesPort },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        { provide: APP_FILTER, useClass: TestRetryAfterFilter },
      ],
    }).compile();
    app = modRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login returns 429 when exceeding method-level limit', async () => {
    const req = (await import('supertest')).default(app.getHttpServer());
    // login has @Throttle limit 5 → perform 6 calls
    for (let i = 0; i < 5; i++) {
      await req.post('/auth/login').send({ email: 'e@example.com', password: 'p' }).expect(200);
    }
    const res = await req.post('/auth/login').send({ email: 'e@example.com', password: 'p' }).expect(429);
    expect(res.body).toEqual({ code: 'error.rate_limited' });
    expect(res.header['retry-after']).toBeDefined();
  });

  it('POST /auth/webauthn/login/start returns 429 when exceeding method-level limit', async () => {
    const req = (await import('supertest')).default(app.getHttpServer());
    // webauthn start has @Throttle limit 10 → perform 11 calls
    for (let i = 0; i < 10; i++) {
      // default POST returns 201 Created here
      await req.post('/auth/webauthn/login/start').send({ email: 'e@example.com' }).expect(201);
    }
    const res = await req.post('/auth/webauthn/login/start').send({ email: 'e@example.com' }).expect(429);
    expect(res.body).toEqual({ code: 'error.rate_limited' });
    expect(res.header['retry-after']).toBeDefined();
  });
});
