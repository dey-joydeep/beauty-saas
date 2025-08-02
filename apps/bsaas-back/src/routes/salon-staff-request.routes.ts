import { Router } from 'express';
import {
  createSalonStaffRequest,
  updateSalonStaffRequest,
  getSalonStaffRequests,
  getPendingSalonStaffRequests,
} from '../modules/salon-staff-request/salon-staff-request.controller';

const router = Router();

router.post('/leave', createSalonStaffRequest);
router.post('/approve', updateSalonStaffRequest);
router.post('/reject', updateSalonStaffRequest);
router.get('/staff/:staffId', getSalonStaffRequests);
router.get('/pending', getPendingSalonStaffRequests);

export default router;
