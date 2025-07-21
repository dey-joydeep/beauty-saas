// SalonController: Handles HTTP for salon search/top salons and single salon details
import { Request, Response, NextFunction } from 'express';
import { SalonService } from './salon.service';
import { ReviewService } from '../review/review.service';
import { requireRole } from '../middleware/requireRole';
import { validate } from '../middleware/validate';
import { searchSalonsSchema } from './salon.validation';

const salonService = new SalonService();
const reviewService = new ReviewService();

// Update parameter type imports to match new modular structure
type GetSalonByIdParams = { salonId: string };
type CreateSalonParams = {
  name: string;
  address: string;
  zipCode: string;
  city: string;
  latitude: number;
  longitude: number;
  ownerId: string;
};
type UpdateSalonParams = {
  salonId: string;
  name?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
};
type DeleteSalonParams = { salonId: string };

export class SalonController {
  // GET /salons/top?lat=...&lng=... (optionally with lat/lng)
  static getTopSalons = [
    validate(searchSalonsSchema),
    async (req: Request, res: Response) => {
      try {
        const lat = req.query.lat ? parseFloat(String(req.query.lat)) : undefined;
        const lng = req.query.lng ? parseFloat(String(req.query.lng)) : undefined;
        const salons = salonService.getTopSalons({
          latitude: lat,
          longitude: lng,
          reviewService,
        });
        res.json(salons);
      } catch (err: any) {
        res.status(400).json({ error: err.message });
      }
    },
  ];

  // GET /salons/search
  static searchSalons = [
    validate(searchSalonsSchema),
    async (req: Request, res: Response) => {
      try {
        const filters = searchSalonsSchema.parse(req.query);
        const salons = await salonService.searchSalons(filters);
        res.json(salons);
      } catch (err: any) {
        res.status(400).json({ error: err.message });
      }
    },
  ];

  static getSalonById = async (req: Request, res: Response) => {
    try {
      const params: GetSalonByIdParams = { salonId: req.params.id };
      const salon = await salonService.getSalonById(params);
      if (!salon) return res.status(404).json({ error: 'Salon not found' });
      res.json(salon);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  static createSalon = async (req: Request, res: Response) => {
    try {
      // Spread req.body to match CreateSalonParams
      const params: CreateSalonParams = { ...req.body };
      const salon = await salonService.createSalon(params);
      res.status(201).json(salon);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  static updateSalon = async (req: Request, res: Response) => {
    try {
      // Spread req.body to match UpdateSalonParams
      const params: UpdateSalonParams = { salonId: req.params.id, ...req.body };
      const salon = await salonService.updateSalon(params);
      if (!salon) return res.status(404).json({ error: 'Salon not found' });
      res.json(salon);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  static deleteSalon = async (req: Request, res: Response) => {
    try {
      const params: DeleteSalonParams = { salonId: req.params.id };
      const deleted = await salonService.deleteSalon(params);
      res.json({ deleted });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}
