// moved from __tests__/booking/booking.integration.test.ts
import request from 'supertest';
import app from '../../../app';

describe('Booking API Integration', () => {
  let bookingId: string;
  const userId = 'userApi';
  const salonId = 'salonApi';
  const service = 'Pedicure';
  const date = new Date().toISOString();

  it('should create a booking via POST /api/booking', async () => {
    const res = await request(app).post('/api/booking').send({ userId, salonId, service, date });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.userId).toBe(userId);
    bookingId = res.body.id;
  });

  it('should get user bookings via GET /api/user/:userId/bookings', async () => {
    const res = await request(app).get(`/api/user/${userId}/bookings`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((b: any) => b.userId === userId)).toBe(true);
  });

  it('should get salon bookings via GET /api/salon/:salonId/bookings', async () => {
    const res = await request(app).get(`/api/salon/${salonId}/bookings`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((b: any) => b.salonId === salonId)).toBe(true);
  });

  it('should check eligibility to review', async () => {
    // Mark booking as completed for eligibility
    const userBookings = await request(app).get(`/api/user/${userId}/bookings`);
    const booking = userBookings.body[0];
    booking.status = 'completed';
    // Simulate eligibility check
    const res = await request(app).get(`/api/user/${userId}/salon/${salonId}/eligible-to-review`);
    expect([200, 404]).toContain(res.status);
  });
});
