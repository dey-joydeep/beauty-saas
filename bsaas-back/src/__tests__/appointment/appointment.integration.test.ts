import request from 'supertest';
import app from '../../app';
import prisma from '../prismaTestClient';

// Test data
const user_id = 'test-user';
const salon_id = 'test-salon';
const service = 'Haircut';
const date = '2023-12-31';
const time = '14:00';

describe('Appointment API Integration Tests', () => {
  // beforeAll(async () => {
  //   // Setup test data
  //   await prisma.user.upsert({
  //     where: { id: user_id },
  //     update: {},
  //     create: {
  //       id: user_id,
  //       email: 'test@example.com',
  //       name: 'Test User',
  //       passwordHash: 'hashedpassword',
  //       tenantId: 'test-tenant',
  //     },
  //   });

  //   await prisma.salon.upsert({
  //     where: { id: salon_id },
  //     update: {},
  //     create: {
  //       id: salon_id,
  //       name: 'Test Salon',
  //       // address: '123 Test St',
  //       tenantId: 'test-tenant',
  //     },
  //   });
  // });

  afterAll(async () => {
    // Clean up test data
    // await prisma.appointment.deleteMany({ where: { userId: user_id } });
    await prisma.user.deleteMany({ where: { id: user_id } });
    await prisma.salon.deleteMany({ where: { id: salon_id } });
  });

  it('should create an appointment via POST /api/appointment', async () => {
    const res = await request(app).post('/api/appointment').send({
      user_id,
      salon_id,
      service,
      date,
      time,
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.userId).toBe(user_id);
    expect(res.body.salonId).toBe(salon_id);
  });

  it('should get user appointments via GET /api/user/:user_id/appointments', async () => {
    const res = await request(app).get(`/api/user/${user_id}/appointments`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].userId).toBe(user_id);
  });

  it('should get salon appointments via GET /api/salon/:salon_id/appointments', async () => {
    const res = await request(app).get(`/api/salon/${salon_id}/appointments`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].salonId).toBe(salon_id);
  });

  it('should update an appointment via PUT /api/appointment/:id', async () => {
    // Get an appointment to update
    const appointments = await request(app).get(`/api/user/${user_id}/appointments`);
    const appointment = appointments.body[0];

    const res = await request(app)
      .put(`/api/appointment/${appointment.id}`)
      .send({ status: 'completed' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
  });

  it('should delete an appointment via DELETE /api/appointment/:id', async () => {
    // Create an appointment to delete
    const createRes = await request(app).post('/api/appointment').send({
      user_id,
      salon_id,
      service: 'To be deleted',
      date,
      time: '15:00',
    });

    const res = await request(app).delete(
      `/api/appointment/${createRes.body.id}`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
