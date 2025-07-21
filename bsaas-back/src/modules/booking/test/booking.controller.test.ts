// moved from __tests__/booking/booking.controller.test.ts
import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaTestClient';
import { BookingService } from '../../booking.service';
import * as bookingController from '../../booking.controller';
import jwt from 'jsonwebtoken';

jest.mock('../../booking.service');

// Inline Booking type to match BookingService
// (keeps all test objects and mocks in sync with service)
type Booking = {
  id: string;
  salonId: string;
  userId: string;
  staffId: string | null;
  serviceId: string;
  date: string;
  time: string;
  status: any;
  notes: string | null;
};

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
mockedService.prototype.getBookings = jest.fn();
mockedService.prototype.createBooking = jest.fn();
mockedService.prototype.updateBooking = jest.fn();
mockedService.prototype.deleteBooking = jest.fn();
mockedService.prototype.getBookingById = jest.fn();
mockedService.prototype.isUserEligibleToReview = jest.fn();
mockedService.prototype.getAverageRatingForSalon = jest.fn();

const testUserId = 'testUserId';
const testSalonId = 'testSalonId';
const testBookingId = 'testBookingId';
const testToken = jwt.sign(
  { id: testUserId, email: 'test@example.com' },
  process.env.JWT_SECRET || 'testsecret',
);

describe('Booking Controller', () => {
  beforeAll(async () => {
    // Provide all required fields for UserCreateInput to fix type error
    await prisma.user.upsert({
      where: { id: testUserId },
      update: {},
      create: {
        id: testUserId,
        email: 'test@example.com',
        passwordHash: 'dummy',
        name: 'Test User',
        tenantId: 'dummyTenant',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: undefined, // Fix: use undefined for optional relation fields
      },
    });
  });

  // ...rest of the test code for all endpoints, using camelCase for all model/interface members...
});
