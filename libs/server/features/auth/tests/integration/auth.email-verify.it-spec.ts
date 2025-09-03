import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@app/app.module';
import { PrismaClient } from '@prisma/client';
import { EMAIL_PORT, EmailPort } from '@cthub-bsaas/server-contracts-auth';

describe('Auth Email Verify IT', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();
  const sent: { to?: string; subject?: string; body?: string } = {};

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(EMAIL_PORT)
      .useValue({
        sendMail: async (to: string, subject: string, body: string) => {
          sent.to = to;
          sent.subject = subject;
          sent.body = body;
        },
      } as EmailPort)
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('requests OTP and confirms via OTP', async () => {
    const server = app.getHttpServer();

    // Ensure a user exists
    const email = 'verify-it@example.com';
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: '$2a$10$Q6o6a8qkPB/Oo9s4yq7kQe9d2Jv2tQhEStYB9V6r6gT4QXzv2n9j2', // bcrypt for 'P@ssw0rd!'
      },
    });

    // Request OTP
    await request(server).post('/auth/email/verify/request').send({ email }).expect(202);
    expect(sent.to).toBe(email);
    expect(sent.body).toBeDefined();
    const otpMatch = sent.body!.match(/(\d{6})/);
    expect(otpMatch).toBeTruthy();
    const otp = otpMatch![1];

    // Confirm via OTP
    await request(server).post('/auth/email/verify/confirm').send({ email, otp }).expect(200);

    const refreshed = await prisma.user.findUnique({ where: { email } });
    expect(refreshed!.emailVerifiedAt).toBeTruthy();
  });
});

