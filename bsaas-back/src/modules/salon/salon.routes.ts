// moved from routes/salon.routes.ts
import { Router } from 'express';
import { SalonController } from '../../controllers/salon/salon.controller';
import { authenticateJWT } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';

const router = Router();

// GET /salons/top?lat=...&lng=...
router.get('/salons/top', SalonController.getTopSalons);
// GET /salons/search
router.get('/salons/search', SalonController.searchSalons);
// GET /salons/:id
router.get('/salons/:id', SalonController.getSalonById);

// --- Staff Management Routes ---
// List staff
router.get(
  '/salons/:salonId/staff',
  authenticateJWT,
  requireRole(['owner', 'admin']),
  SalonController.getStaff,
);
// Activate staff
router.post(
  '/salons/:salonId/staff/:staffId/activate',
  authenticateJWT,
  requireRole(['owner', 'admin']),
  SalonController.activateStaff,
);
// Deactivate staff
router.post(
  '/salons/:salonId/staff/:staffId/deactivate',
  authenticateJWT,
  requireRole(['owner', 'admin']),
  SalonController.deactivateStaff,
);
// Add staff
router.post(
  '/salons/:salonId/staff',
  authenticateJWT,
  requireRole(['owner', 'admin']),
  SalonController.addStaff,
);
// Remove staff
router.delete(
  '/salons/:salonId/staff/:staffId',
  authenticateJWT,
  requireRole(['owner', 'admin']),
  SalonController.removeStaff,
);

// --- Service/Product Approval Routes ---
// List services
router.get(
  '/salons/:salonId/services',
  authenticateJWT,
  requireRole(['owner', 'admin']),
  SalonController.getServices,
);
// Approve service
router.post(
  '/salons/:salonId/services/:serviceId/approve',
  authenticateJWT,
  requireRole(['owner', 'admin']),
  SalonController.approveService,
);
// Revoke service
router.post(
  '/salons/:salonId/services/:serviceId/revoke',
  authenticateJWT,
  requireRole(['owner', 'admin']),
  SalonController.revokeService,
);
// Add service
router.post(
  '/salons/:salonId/services',
  authenticateJWT,
  requireRole(['owner', 'admin']),
  SalonController.addService,
);
// Remove service
router.delete(
  '/salons/:salonId/services/:serviceId',
  authenticateJWT,
  requireRole(['owner', 'admin']),
  SalonController.removeService,
);

export default router;
