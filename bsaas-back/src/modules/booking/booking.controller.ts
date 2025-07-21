import { Request, Response } from 'express';
import { BookingService, BookingStatus } from './booking.service';
import type {
  GetBookingsParams,
  CreateBookingParams,
  UpdateBookingParams,
  DeleteBookingParams,
  GetBookingByIdParams,
} from './booking-params.model';
import { authenticateJWT } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { createBookingSchema, updateBookingSchema } from './booking.validation';
import type { NextFunction } from 'express';
import { isISODateString, isTimeString } from '../../utils/validators';

const bookingService = new BookingService();

function sanitizeBookingInput(data: CreateBookingParams['data']) {
  // Ensure staffId and notes are always string|null, never undefined
  return {
    ...data,
    staffId: typeof data.staffId === 'undefined' ? null : data.staffId,
    notes: typeof data.notes === 'undefined' ? null : data.notes,
  };
}

function withAuthAndRole(
  roles: string[],
  handler: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) {
  return [authenticateJWT, requireRole(roles), handler];
}

export const getBookings = withAuthAndRole(
  ['admin', 'owner', 'staff', 'customer'],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params: GetBookingsParams = { filter: req.query };
      const bookings = await bookingService.getBookings(params);
      res.json(bookings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
);

export const createBooking = [
  authenticateJWT,
  requireRole(['customer']),
  validate(createBookingSchema),
  async (req: Request, res: Response) => {
    try {
      const data = sanitizeBookingInput(req.body);
      const bookingData = {
        staffId: data.staffId,
        notes: data.notes,
        salonId: data.salonId,
        userId: data.userId,
        serviceId: data.serviceId,
        date: data.date,
        time: data.time,
        status: data.status as BookingStatus,
      };
      const booking = await bookingService.createBooking({ data: bookingData });
      res.status(201).json(booking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
];

export const updateBooking = [
  authenticateJWT,
  requireRole(['admin', 'owner', 'staff']),
  validate(updateBookingSchema),
  async (req: Request, res: Response) => {
    try {
      const data = sanitizeBookingInput(req.body);
      const bookingData = {
        staffId: data.staffId,
        notes: data.notes,
        salonId: data.salonId,
        userId: data.userId,
        serviceId: data.serviceId,
        date: data.date,
        time: data.time,
        status: data.status as BookingStatus,
      };
      const booking = await bookingService.updateBooking({ id: req.params.id, data: bookingData });
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
];

export const deleteBooking = withAuthAndRole(
  ['admin', 'owner'],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params: DeleteBookingParams = { id: req.params.id };
      await bookingService.deleteBooking(params);
      res.status(204).end();
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
);

export const getBookingById = withAuthAndRole(
  ['admin', 'owner', 'staff', 'customer'],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params: GetBookingByIdParams = { id: req.params.id };
      const booking = await bookingService.getBookingById(params);
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      res.json(booking);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
);
