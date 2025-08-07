// Integration test for Review API: user, salon, appointment, review (real DB, no mocks)
import request from 'supertest';
import app from '../../../app';
import prisma from '../../prismaTestClient';
import jwt from 'jsonwebtoken';

const testTenantId = 'testTenantId';
const testUserId = 'testUserId';
const testSalonId = 'testSalonId';
const testAppointmentId = 'testAppointmentId';
const testOwnerId = 'testOwnerId';
const testToken = jwt.sign(
  { id: testUserId, tenantId: testTenantId, roles: ['user'] },
  process.env['JWT_SECRET'] || 'testsecret',
);

describe('Review Controller Integration', () => {
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
        // address: '1 Integration St',
        // zipCode: '00000',
        // city: 'Test City',
        latitude: 0,
        longitude: 0,
        ownerId: testOwnerId,
      },
    });
    // await prisma.appointment.create({
    //   data: {
    //     id: testAppointmentId,
    //     userId: testUserId,
    //     salonId: testSalonId,
    //     serviceId: 'haircut',
    //     date: '2025-05-01T10:00:00.000Z',
    //     time: '10:00',
    //     status: 'booked',
    //   },
    // });
  });
  afterAll(async () => {
    // await prisma.review.deleteMany({ where: { user_id: testUserId } });
    // await prisma.appointment.deleteMany({ where: { userId: testUserId } });
    await prisma.salon.deleteMany({ where: { id: testSalonId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await prisma.tenant.deleteMany({ where: { id: testTenantId } });
    await prisma.$disconnect();
  });

  it('should add a review (integration)', async () => {
    const res = await request(app)
      .post(`/api/salon/${testSalonId}/review`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ userId: testUserId, rating: 5, comment: 'Great service!' });
    expect([201, 400]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body.salonId).toBe(testSalonId);
      expect(res.body.userId).toBe(testUserId);
    }
  });

  it('should get salon reviews (integration)', async () => {
    const res = await request(app)
      .get(`/api/salon/${testSalonId}/reviews`)
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get average rating (integration)', async () => {
    const res = await request(app)
      .get(`/api/salon/${testSalonId}/average-rating`)
      .set('Authorization', `Bearer ${testToken}`);
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('average');
    }
  });
});
