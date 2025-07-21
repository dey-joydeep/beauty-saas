import { Router } from 'express';
import { SalonController } from '../modules/salon/salon.controller';
import { authenticateJWT } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// GET /salons/top?lat=...&lng=...
router.get('/salons/top', SalonController.getTopSalons);
// GET /salons/search
router.get('/salons/search', SalonController.searchSalons);
// GET /salons/:id
router.get('/salons/:id', SalonController.getSalonById);

// --- Salon Management Routes ---
// Create salon
router.post('/salons', authenticateJWT, requireRole(['owner']), SalonController.createSalon);
// Update salon
router.put('/salons/:id', authenticateJWT, requireRole(['owner']), SalonController.updateSalon);
// Delete salon
router.delete('/salons/:id', authenticateJWT, requireRole(['owner']), SalonController.deleteSalon);

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
