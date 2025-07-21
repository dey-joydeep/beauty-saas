import request from 'supertest';
import app from '../../app';
import prisma from '../prismaTestClient';
import { BookingService } from '../../services/booking.service';
import * as bookingController from '../../controllers/booking.controller';
import jwt from 'jsonwebtoken';

jest.mock('../../services/booking.service');

interface BookingServiceMock extends jest.MockedClass<typeof BookingService> {
  prototype: {
    getBookings: jest.Mock;
    createBooking: jest.Mock;
    updateBooking: jest.Mock;
    deleteBooking: jest.Mock;
    getBookingById: jest.Mock;
    isUserEligibleToReview: jest.Mock;
    getAverageRatingForSalon: jest.Mock;
  };
}

const mockedService = BookingService as unknown as BookingServiceMock;

// Patch all prototype methods (for runtime)
mockedService.prototype.getBookings = jest.fn();
mockedService.prototype.createBooking = jest.fn();
mockedService.prototype.updateBooking = jest.fn();
mockedService.prototype.deleteBooking = jest.fn();
mockedService.prototype.getBookingById = jest.fn();
mockedService.prototype.isUserEligibleToReview = jest.fn();
mockedService.prototype.getAverageRatingForSalon = jest.fn();

const testUserId = 'test-user';
const testSalonId = 'test-salon';
const testBookingId = 'test-booking';
const testToken = jwt.sign(
  { id: testUserId, email: 'test@example.com' },
  process.env.JWT_SECRET || 'testsecret',
);

describe('Booking Controller', () => {
  beforeAll(async () => {
    await prisma.user.upsert({
      where: { id: testUserId },
      update: {},
      create: {
        id: testUserId,
        tenantId: 'test-tenant',
        email: 'test@example.com',
        name: 'Test User',
        isVerified: true,
        passwordHash: 'hashed',
      },
    });
    await prisma.$disconnect();
  });

  describe('GET /user/:user_id/bookings', () => {
    it('should return bookings for user', async () => {
      (mockedService.prototype.getBookings as jest.Mock).mockResolvedValueOnce([
        {
          id: testBookingId,
          userId: testUserId,
          salonId: testSalonId,
          service: 'Haircut',
          date: new Date(),
          status: 'upcoming',
        },
      ]);
      const res = await request(app)
        .get(`/api/user/${testUserId}/bookings`)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(res.body[0].userId).toBe(testUserId);
    });
    it('should return 400 on error', async () => {
      (mockedService.prototype.getBookings as jest.Mock).mockRejectedValueOnce(new Error('fail'));
      const res = await request(app)
        .get(`/api/user/${testUserId}/bookings`)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /salon/:salon_id/bookings', () => {
    it('should return bookings for salon', async () => {
      (mockedService.prototype.getBookings as jest.Mock).mockReturnValueOnce([
        {
          id: testBookingId,
          userId: testUserId,
          salonId: testSalonId,
          service: 'Haircut',
          date: new Date(),
          status: 'upcoming',
        },
      ]);
      const res = await request(app)
        .get(`/api/salon/${testSalonId}/bookings`)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(res.body[0].salonId).toBe(testSalonId);
    });
    it('should return 400 on error', async () => {
      (mockedService.prototype.getBookings as jest.Mock).mockImplementationOnce(() => {
        throw new Error('fail');
      });
      const res = await request(app)
        .get(`/api/salon/${testSalonId}/bookings`)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /booking', () => {
    it('should create booking', async () => {
      (mockedService.prototype.createBooking as jest.Mock).mockReturnValueOnce({
        id: testBookingId,
        userId: testUserId,
        salonId: testSalonId,
        service: 'Haircut',
        date: new Date(),
        status: 'upcoming',
      });
      const res = await request(app)
        .post('/api/booking')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ userId: testUserId, salonId: testSalonId, service: 'haircut', date: '2025-01-01' });
      expect(res.status).toBe(201);
      expect(res.body.id).toBe(testBookingId);
    });
    it('should return 400 if missing fields', async () => {
      const res = await request(app)
        .post('/api/booking')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ userId: testUserId });
      expect(res.status).toBe(400);
    });
    it('should return 400 on error', async () => {
      (mockedService.prototype.createBooking as jest.Mock).mockRejectedValueOnce(new Error('fail'));
      const res = await request(app)
        .post('/api/booking')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ userId: testUserId, salonId: testSalonId, service: 'haircut', date: '2025-01-01' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /user/:user_id/salon/:salon_id/eligible-to-review', () => {
    it('should return eligibility', async () => {
      (mockedService.prototype.isUserEligibleToReview as jest.Mock).mockReturnValueOnce(true);
      const res = await request(app)
        .get(`/api/user/${testUserId}/salon/${testSalonId}/eligible-to-review`)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(res.body.eligible).toBe(true);
    });
    it('should return 400 on error', async () => {
      (mockedService.prototype.isUserEligibleToReview as jest.Mock).mockImplementationOnce(() => {
        throw new Error('fail');
      });
      const res = await request(app)
        .get(`/api/user/${testUserId}/salon/${testSalonId}/eligible-to-review`)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /salon/:salon_id/average-rating', () => {
    it('should return average rating', async () => {
      (mockedService.prototype.getAverageRatingForSalon as jest.Mock).mockResolvedValueOnce(4.5);
      const res = await request(app)
        .get(`/api/salon/${testSalonId}/average-rating`)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(res.body.average_rating).toBe(4.5);
    });
    it('should return 400 on error', async () => {
      (mockedService.prototype.getAverageRatingForSalon as jest.Mock).mockRejectedValueOnce(
        new Error('fail'),
      );
      const res = await request(app)
        .get(`/api/salon/${testSalonId}/average-rating`)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /booking/:id', () => {
    it('should update a booking', async () => {
      (mockedService.prototype.updateBooking as jest.Mock).mockResolvedValueOnce({
        id: testBookingId,
        userId: testUserId,
        salonId: testSalonId,
        service: 'Haircut',
        date: new Date(),
        status: 'completed',
      });
      const res = await request(app)
        .put(`/api/booking/${testBookingId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ status: 'completed' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('completed');
    });
    it('should return 404 if not found', async () => {
      (mockedService.prototype.updateBooking as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(app)
        .put(`/api/booking/${testBookingId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ status: 'completed' });
      expect(res.status).toBe(404);
    });
    it('should return 400 on error', async () => {
      (mockedService.prototype.updateBooking as jest.Mock).mockRejectedValueOnce(new Error('fail'));
      const res = await request(app)
        .put(`/api/booking/${testBookingId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ status: 'completed' });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /booking/:id', () => {
    it('should delete a booking', async () => {
      (mockedService.prototype.deleteBooking as jest.Mock).mockResolvedValueOnce({
        id: testBookingId,
        userId: testUserId,
        salonId: testSalonId,
        service: 'Haircut',
        date: new Date(),
        status: 'cancelled',
      });
      const res = await request(app)
        .delete(`/api/booking/${testBookingId}`)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('cancelled');
    });
    it('should return 404 if not found', async () => {
      (mockedService.prototype.deleteBooking as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(app)
        .delete(`/api/booking/${testBookingId}`)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(404);
    });
    it('should return 400 on error', async () => {
      (mockedService.prototype.deleteBooking as jest.Mock).mockRejectedValueOnce(new Error('fail'));
      const res = await request(app)
        .delete(`/api/booking/${testBookingId}`)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /booking/:id', () => {
    it('should get a single booking', async () => {
      (mockedService.prototype.getBookingById as jest.Mock).mockResolvedValueOnce({
        id: testBookingId,
        userId: testUserId,
        salonId: testSalonId,
        service: 'Haircut',
        date: new Date(),
        status: 'upcoming',
      });
      const res = await request(app)
        .get(`/api/booking/${testBookingId}`)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(testBookingId);
    });
    it('should return 404 if booking not found', async () => {
      (mockedService.prototype.getBookingById as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(app)
        .get('/api/booking/nonexistent')
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(404);
    });
    it('should return 400 on error', async () => {
      (mockedService.prototype.getBookingById as jest.Mock).mockRejectedValueOnce(
        new Error('fail'),
      );
      const res = await request(app)
        .get(`/api/booking/${testBookingId}`)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(400);
    });
  });
});
