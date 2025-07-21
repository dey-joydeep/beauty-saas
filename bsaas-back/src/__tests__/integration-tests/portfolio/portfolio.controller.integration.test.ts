// Move controller integration tests (real API + DB) here. Do not use mocks.

import request from 'supertest';
import app from '../../../app';
import path from 'path';
import * as fs from 'fs';
import prisma from '../../prismaTestClient';
import jwt from 'jsonwebtoken';
import { createSolidColorImage } from '../../testHelper';

const testImagePath = path.join(__dirname, '../../portfolio/test-image.png');
const testTenantId = 'testTenantId';
const testUserId = 'testUserId';
const testPortfolioId = 'testPortfolioId';

const testToken = jwt.sign(
  { id: testUserId, tenantId: testTenantId, roles: ['owner'] },
  process.env.JWT_SECRET || 'testsecret',
);

describe('Portfolio Controller Integration', () => {
  beforeAll(async () => {
    await prisma.tenant.upsert({
      where: { id: testTenantId },
      update: {},
      create: { id: testTenantId, name: 'Test Tenant', email: 'test-tenant@example.com' },
    });
    await prisma.user.upsert({
      where: { id: testUserId },
      update: {},
      create: {
        id: testUserId,
        tenantId: testTenantId,
        email: 'test@example.com',
        name: 'Test User',
        isVerified: true,
        passwordHash: 'hashed',
        roles: {
          create: [{ role: { connect: { name: 'owner' } } }],
        },
      },
    });
    await createSolidColorImage(testImagePath, 10, 10, [255, 0, 0, 255]);
  });
  afterAll(async () => {
    fs.unlinkSync(testImagePath);
    await prisma.portfolio.deleteMany({ where: { tenantId: testTenantId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await prisma.tenant.deleteMany({ where: { id: testTenantId } });
    await prisma.$disconnect();
  });
  it('should return 201 on valid image upload (integration)', async () => {
    const res = await request(app)
      .post('/api/portfolio')
      .set('Authorization', `Bearer ${testToken}`)
      .field('tenantId', testTenantId)
      .field('userId', testUserId)
      .field('description', 'desc')
      .attach('image', testImagePath);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });
  it('should return 400 if image file is missing (integration)', async () => {
    const res = await request(app)
      .post('/api/portfolio')
      .set('Authorization', `Bearer ${testToken}`)
      .field('tenantId', testTenantId)
      .field('userId', testUserId)
      .field('description', 'desc');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/image file/i);
  });
  // ... (other controller integration tests as in original, using real DB/API)
});
