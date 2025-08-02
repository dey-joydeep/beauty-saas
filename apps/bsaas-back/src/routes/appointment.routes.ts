import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { authenticateJWT } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// User appointment history (protected)
router.get('/user/:user_id/appointments', authenticateJWT, AppointmentController.getUserAppointments);

// Salon customer history (protected)
router.get(
  '/salon/:salon_id/appointments',
  authenticateJWT,
  requireRole(['owner', 'admin', 'staff']),
  AppointmentController.getSalonAppointments,
);

// Eligibility to review (protected)
router.get(
  '/user/:user_id/salon/:salon_id/eligible-to-review',
  authenticateJWT,
  AppointmentController.checkUserEligibleToReview,
);

// Appointment creation (protected)
router.post('/appointment', authenticateJWT, AppointmentController.createAppointment);

export default router;
