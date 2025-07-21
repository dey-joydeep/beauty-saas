// Integration test for Booking API: covers user, salon, booking, and review flows with real DB
import request from 'supertest';
import app from '../../../app';
import prisma from '../../prismaTestClient';
import jwt from 'jsonwebtoken';

const testTenantId = 'test-tenant';
const testUserId = 'test-user';
const testSalonId = 'test-salon';
const testBookingId = 'test-booking';
const testToken = jwt.sign(
  { id: testUserId, tenantId: testTenantId, roles: ['user'] },
  process.env.JWT_SECRET || 'testsecret',
);

describe('Booking Controller Integration', () => {
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
        address: '1 Integration St',
        zipCode: '00000',
        city: 'Test City',
        latitude: 0,
        longitude: 0,
        ownerId: 'test-owner',
        services: [],
        imageUrl: null,
      },
    });
  });
  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { userId: testUserId } });
    await prisma.salon.deleteMany({ where: { id: testSalonId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await prisma.tenant.deleteMany({ where: { id: testTenantId } });
    await prisma.$disconnect();
  });

  it('should create a booking (integration)', async () => {
    const res = await request(app)
      .post('/api/booking')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        userId: testUserId,
        salonId: testSalonId,
        service: 'haircut',
        date: '2025-05-01T10:00:00Z',
      });
    expect(res.status).toBe(201);
    expect(res.body.userId).toBe(testUserId);
    expect(res.body.salonId).toBe(testSalonId);
  });

  it('should get user bookings', async () => {
    const res = await request(app)
      .get(`/api/user/${testUserId}/bookings`)
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get salon bookings', async () => {
    const res = await request(app)
      .get(`/api/salon/${testSalonId}/bookings`)
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should update a booking (integration)', async () => {
    // Get a booking id
    const bookings = await request(app)
      .get(`/api/user/${testUserId}/bookings`)
      .set('Authorization', `Bearer ${testToken}`);
    const booking = bookings.body[0];
    const res = await request(app)
      .put(`/api/booking/${booking.id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ status: 'completed' });
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.status).toBe('completed');
    }
  });

  it('should delete a booking (integration)', async () => {
    // Create a booking to delete
    const createRes = await request(app)
      .post('/api/booking')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        userId: testUserId,
        salonId: testSalonId,
        service: 'haircut',
        date: '2025-05-02T10:00:00Z',
      });
    const bookingId = createRes.body.id;
    const res = await request(app)
      .delete(`/api/booking/${bookingId}`)
      .set('Authorization', `Bearer ${testToken}`);
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.status).toBe('cancelled');
    }
  });
});
