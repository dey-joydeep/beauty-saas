// Integration test for Appointment API: covers user, salon, appointment, and review flows with real DB
import request from 'supertest';
import app from '../../../app';
import prisma from '../../prismaTestClient';
import jwt from 'jsonwebtoken';

const testTenantId = 'test-tenant';
const testUserId = 'test-user';
const testSalonId = 'test-salon';
const testAppointmentId = 'test-appointment';
const testToken = jwt.sign(
  { id: testUserId, tenantId: testTenantId, roles: ['user'] },
  process.env.JWT_SECRET || 'testsecret',
);

describe('Appointment Controller Integration', () => {
  beforeAll(async () => {
    // await prisma.tenant.upsert({
    //   where: { id: testTenantId },
    //   update: {},
    //   create: { id: testTenantId, name: 'Test Tenant' },
    // });

    await prisma.user.upsert({
      where: { id: testUserId },
      update: {},
      create: {
        id: testUserId,
        email: 'test@example.com',
        name: 'Test User',
        tenantId: testTenantId,
        passwordHash: 'hashedpassword',
      },
    });

    // await prisma.salon.upsert({
    //   where: { id: testSalonId },
    //   update: {},
    //   create: {
    //     id: testSalonId,
    //     name: 'Test Salon',
    //     address: '123 Test St',
    //     tenantId: testTenantId,
    //   },
    // });
  });

  afterAll(async () => {
    // Clean up test data
    // await prisma.appointment.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await prisma.salon.deleteMany({ where: { id: testSalonId } });
    await prisma.tenant.deleteMany({ where: { id: testTenantId } });
  });

  it('should create an appointment (integration)', async () => {
    const res = await request(app)
      .post('/api/appointment')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        salonId: testSalonId,
        serviceId: 'test-service',
        date: '2023-12-31',
        time: '14:00',
        notes: 'Test appointment',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.userId).toBe(testUserId);
    expect(res.body.salonId).toBe(testSalonId);
  });

  it('should get user appointments', async () => {
    const res = await request(app)
      .get(`/api/user/${testUserId}/appointments`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get salon appointments', async () => {
    const res = await request(app)
      .get(`/api/salon/${testSalonId}/appointments`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should update an appointment (integration)', async () => {
    // Get an appointment id
    const appointments = await request(app)
      .get(`/api/user/${testUserId}/appointments`)
      .set('Authorization', `Bearer ${testToken}`);
    
    const appointment = appointments.body[0];
    
    const res = await request(app)
      .put(`/api/appointment/${appointment.id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ notes: 'Updated test appointment' });

    expect(res.status).toBe(200);
    expect(res.body.notes).toBe('Updated test appointment');
  });

  it('should delete an appointment (integration)', async () => {
    // Create an appointment to delete
    const createRes = await request(app)
      .post('/api/appointment')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        salonId: testSalonId,
        serviceId: 'test-service-delete',
        date: '2023-12-31',
        time: '15:00',
      });

    const appointmentId = createRes.body.id;

    const res = await request(app)
      .delete(`/api/appointment/${appointmentId}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
