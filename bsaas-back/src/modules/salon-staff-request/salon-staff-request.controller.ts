import { Request, Response } from 'express';
import { authenticateJWT } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import {
  createSalonStaffRequestSchema,
  updateSalonStaffRequestSchema,
} from './salon-staff-request.validation';
import { SalonStaffRequestService } from './salon-staff-request.service';

const salonStaffRequestService = new SalonStaffRequestService();

export const createSalonStaffRequest = [
  authenticateJWT,
  requireRole(['owner', 'admin']),
  validate(createSalonStaffRequestSchema),
  async (req: Request, res: Response) => {
    try {
      const result = await salonStaffRequestService.createRequest(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
];

export const updateSalonStaffRequest = [
  authenticateJWT,
  requireRole(['owner', 'admin']),
  validate(updateSalonStaffRequestSchema),
  async (req: Request, res: Response) => {
    try {
      const result = await salonStaffRequestService.updateRequest(req.params.id, req.body);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
];

export const deleteSalonStaffRequest = [
  authenticateJWT,
  requireRole(['owner', 'admin']),
  async (req: Request, res: Response) => {
    try {
      await salonStaffRequestService.deleteRequest(req.params.id);
      res.status(204).end();
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
];

export const getSalonStaffRequestById = [
  authenticateJWT,
  requireRole(['owner', 'admin', 'staff']),
  async (req: Request, res: Response) => {
    try {
      const result = await salonStaffRequestService.getRequestById(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  },
];

export const getSalonStaffRequests = [
  authenticateJWT,
  requireRole(['owner', 'admin']),
  async (req: Request, res: Response) => {
    try {
      const results = await salonStaffRequestService.getRequests(req.query);
      res.json(results);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
];

export const getPendingSalonStaffRequests = [
  authenticateJWT,
  requireRole(['owner', 'admin']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const results = await salonStaffRequestService.getRequests({ status: 'pending' });
      res.json(results);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(400).json({ error: 'Unknown error' });
      }
    }
  },
];
