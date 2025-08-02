// Placeholder for salon controller integration tests (real API + DB)

import request from 'supertest';
import app from '../../../app';
import prisma from '../../prismaTestClient';
import jwt from 'jsonwebtoken';

const testTenantId = 'test-tenant';
const testUserId = 'test-user';
const testSalonId = 'test-salon';
const testToken = jwt.sign(
  { id: testUserId, tenantId: testTenantId, roles: ['owner'] },
  process.env.JWT_SECRET || 'testsecret',
);

describe('Salon Controller Integration', () => {
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
      },
    });
    await prisma.salon.upsert({
      where: { id: testSalonId },
      update: {},
      create: {
        id: testSalonId,
        tenantId: testTenantId,
        name: 'Salon Integration',
        // address: '123 St',
        // city: 'City',
        // zipCode: '12345',
        // latitude: 0,
        // longitude: 0,
        ownerId: testUserId,
      },
    });
  });
  afterAll(async () => {
    await prisma.salon.deleteMany({ where: { id: testSalonId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await prisma.tenant.deleteMany({ where: { id: testTenantId } });
    await prisma.$disconnect();
  });

  it('should return salons for search', async () => {
    const res = await request(app)
      .get('/api/salon/search?q=Salon Integration')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].id).toBe(testSalonId);
  });

  // Add more integration tests as needed
});
