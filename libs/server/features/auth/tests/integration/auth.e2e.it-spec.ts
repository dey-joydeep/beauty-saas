import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@app/app.module';
import { PrismaClient } from '@prisma/client';

describe('Auth IT (entry to DB)', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();
  const email = 'it-user@example.com';
  const password = 'P@ssw0rd!';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('login issues cookies, creates session and refresh token', async () => {
    const server = app.getHttpServer();
    const agent = request.agent(server);
    const res = await agent
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    const sc = res.get('set-cookie') as unknown;
    const cookieStr = Array.isArray(sc) ? (sc as string[]).join(';') : String(sc ?? '');
    expect(cookieStr).toContain('bsaas_rt=');
    expect(cookieStr).toContain('bsaas_at=');
    expect(cookieStr).toContain('XSRF-TOKEN=');

    // Verify DB state
    const user = await prisma.user.findUnique({ where: { email } });
    expect(user).toBeTruthy();
    const sessions = await prisma.session.findMany({ where: { userId: user!.id } });
    const rts = await prisma.refreshToken.findMany({ where: { userId: user!.id } });
    expect(sessions.length).toBeGreaterThanOrEqual(1);
    expect(rts.length).toBeGreaterThanOrEqual(1);

    // List sessions with cookie-based AT
    await agent
      .get('/auth/sessions')
      .expect(200)
      .expect((r) => {
        expect(Array.isArray(r.body)).toBe(true);
      });

    // Extract CSRF cookie value for subsequent protected POST
    const setCookie = res.get('set-cookie') as unknown;
    const cookies = Array.isArray(setCookie) ? (setCookie as string[]) : String(setCookie ?? '').split('\n');
    const xsrfCookie = cookies.find((c) => c.startsWith('XSRF-TOKEN=')) || '';
    const xsrfValue = xsrfCookie.split(';')[0].split('=')[1] || '';

    // Logout with CSRF header
    await agent
      .post('/auth/logout')
      .set('X-XSRF-TOKEN', xsrfValue)
      .expect(201);

    // Session should be removed
    const afterSessions = await prisma.session.findMany({ where: { userId: user!.id } });
    expect(afterSessions.length).toBe(0);
  }, 20000);

  it('refresh rotates token and revoke session with CSRF', async () => {
    const server = app.getHttpServer();
    const agent = request.agent(server);

    // Login to receive cookies (AT/RT + XSRF-TOKEN)
    const signInRes = await agent
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    // Extract CSRF cookie value for subsequent protected POST
    const setCookie = signInRes.get('set-cookie') as unknown;
    const cookies = Array.isArray(setCookie) ? (setCookie as string[]) : String(setCookie ?? '').split('\n');
    const xsrfCookie = cookies.find((c) => c.startsWith('XSRF-TOKEN=')) || '';
    const xsrfValue = xsrfCookie.split(';')[0].split('=')[1] || '';

    // Create a body refresh token signed with test secret using stored JTI
    const user = await prisma.user.findUnique({ where: { email } });
    expect(user).toBeTruthy();
    const rt = await prisma.refreshToken.findFirst({ where: { userId: user!.id }, orderBy: { issuedAt: 'desc' } });
    expect(rt).toBeTruthy();
    const jwt = (await import('jsonwebtoken')) as typeof import('jsonwebtoken');
    const refreshJwt = jwt.sign({ sub: user!.id, jti: rt!.jti }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'test-refresh-secret', { expiresIn: '7d' });

    // Call refresh with body token (cookies rotated)
    await agent.post('/auth/refresh').send({ refreshToken: refreshJwt }).expect(200);

    // List sessions and pick one to revoke
    const listRes = await agent.get('/auth/sessions').expect(200);
    const sessions = listRes.body as Array<{ id: string }>;
    expect(Array.isArray(sessions)).toBe(true);
    expect(sessions.length).toBeGreaterThan(0);
    const sid = sessions[0].id;

    // Revoke specific session with CSRF header matching cookie
    await agent.post(`/auth/sessions/revoke/${sid}`).set('X-XSRF-TOKEN', xsrfValue).expect(201);

    // Verify it is gone
    const after = await agent.get('/auth/sessions').expect(200);
    const afterSessions = after.body as Array<{ id: string }>;
    expect(afterSessions.find((s) => s.id === sid)).toBeFalsy();
  }, 20000);
});
