import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticateJWT } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// User booking history (protected)
router.get('/user/:user_id/bookings', authenticateJWT, BookingController.getUserBookings);
// Salon customer history (protected)
router.get(
  '/salon/:salon_id/bookings',
  authenticateJWT,
  requireRole(['owner', 'admin', 'staff']),
  BookingController.getSalonBookings,
);
// Eligibility to review (protected)
router.get(
  '/user/:user_id/salon/:salon_id/eligible-to-review',
  authenticateJWT,
  BookingController.checkUserEligibleToReview,
);
// Booking creation (protected)
router.post('/booking', authenticateJWT, BookingController.createBooking);

export default router;
