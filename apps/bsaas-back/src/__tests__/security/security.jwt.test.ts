import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import * as fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import prisma from '../prismaTestClient';

describe('Security: JWT Authentication', () => {
  // Load .env.test before running tests
  beforeAll(async () => {
    const envPath = path.resolve(__dirname, '../../.env.test');
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    }
    // Ensure tenant exists
    let tenant = await prisma.tenant.findUnique({ where: { id: 'test-tenant' } });
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          id: 'test-tenant',
          name: 'Test Tenant',
          email: 'test-tenant@example.com',
        },
      });
    }
    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { id: 'test-user' } });
    if (!user) {
      await prisma.user.create({
        data: {
          id: 'test-user',
          tenantId: 'test-tenant',
          email: 'test@example.com',
          name: 'Test User',
          isVerified: true,
          passwordHash: 'hashedpassword',
        },
      });
    } else {
      // Update existing user to ensure required fields
      await prisma.user.update({
        where: { id: 'test-user' },
        data: {
          isVerified: true,
          passwordHash: 'hashedpassword',
        },
      });
    }
    // Clean up portfolios with null image_data (no longer needed, handled manually)
    // await prisma.portfolio.deleteMany({ where: { image_data: { equals: null } } });
  });

  afterAll(async () => {
    // Clean up
    await prisma.portfolio.deleteMany({ where: { tenantId: 'test-tenant' } });
    await prisma.user.deleteMany({ where: { id: 'test-user' } });
    await prisma.tenant.deleteMany({ where: { id: 'test-tenant' } });
    await prisma.$disconnect();
  });

  const secret = process.env['JWT_SECRET'] || 'test_secret';
  const validPayload = {
    id: 'test-user',
    email: 'test@example.com',
    roles: ['user'],
    tenant_id: 'test-tenant',
  };
  const validToken = jwt.sign(validPayload, secret, { expiresIn: '1h' });
  const expiredToken = jwt.sign(validPayload, secret, { expiresIn: -10 });
  const malformedToken = validToken.split('.').slice(0, 2).join('.') + '.invalidsig';
  const forgedToken = jwt.sign({ ...validPayload, email: 'hacker@example.com' }, 'wrong_secret', {
    expiresIn: '1h',
  });

  it('should return 401 for expired JWT', async () => {
    const res = await request(app)
      .get('/api/portfolio')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
  });

  it('should return 401 for malformed JWT', async () => {
    const res = await request(app)
      .get('/api/portfolio')
      .set('Authorization', `Bearer ${malformedToken}`);
    expect(res.status).toBe(401);
  });

  it('should return 401 for forged JWT', async () => {
    const res = await request(app)
      .get('/api/portfolio')
      .set('Authorization', `Bearer ${forgedToken}`);
    expect(res.status).toBe(401);
  });

  it('should return 200 or 404 for valid JWT', async () => {
    const res = await request(app)
      .get('/api/portfolio')
      .set('Authorization', `Bearer ${validToken}`);
    if (![200, 404].includes(res.status)) {
      throw new Error(
        `Unexpected status: ${res.status}\nBody: ${JSON.stringify(res.body)}\nText: ${res.text}`,
      );
    }
    expect([200, 404]).toContain(res.status);
  });
});
