import request from 'supertest';
import app from '../../app';

describe('Booking API Integration', () => {
  let bookingId: string;
  const user_id = 'user_api';
  const salon_id = 'salon_api';
  const service = 'Pedicure';
  const date = new Date().toISOString();

  it('should create a booking via POST /api/booking', async () => {
    const res = await request(app).post('/api/booking').send({ user_id, salon_id, service, date });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.user_id).toBe(user_id);
    bookingId = res.body.id;
  });

  it('should get user bookings via GET /api/user/:user_id/bookings', async () => {
    const res = await request(app).get(`/api/user/${user_id}/bookings`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((b: any) => b.user_id === user_id)).toBe(true);
  });

  it('should get salon bookings via GET /api/salon/:salon_id/bookings', async () => {
    const res = await request(app).get(`/api/salon/${salon_id}/bookings`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((b: any) => b.salon_id === salon_id)).toBe(true);
  });

  it('should check eligibility to review', async () => {
    // Mark booking as completed for eligibility
    const userBookings = await request(app).get(`/api/user/${user_id}/bookings`);
    const booking = userBookings.body[0];
    booking.status = 'completed';
    // Simulate eligibility check
    const res = await request(app).get(`/api/user/${user_id}/salon/${salon_id}/eligible-to-review`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('eligible');
  });
});
