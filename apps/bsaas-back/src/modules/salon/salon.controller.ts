// SalonController: Handles HTTP for salon search/top salons and single salon details
import { Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../../common/middleware/validate';
import { ReviewService } from '../review/review.service';
import { SalonService } from './salon.service';
import { searchSalonsSchema } from './salon.validation';

// Define request parameter types
type GetSalonByIdRequest = Request<{ id: string }>;
type CreateSalonRequest = Request<{}, {}, {
  name: string;
  address: string;
  zipCode: string;
  city: string;
  latitude: number;
  longitude: number;
  ownerId: string;
}>;
type UpdateSalonRequest = Request<{ id: string }, {}, {
  name?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}>;
type DeleteSalonRequest = Request<{ id: string }>;

// Define query parameter types
type TopSalonsQuery = {
  lat?: string;
  lng?: string;
};

class SalonController {
  private static instance: SalonController;
  private salonService: SalonService;
  private reviewService: ReviewService;
  
  private constructor() {
    this.salonService = new SalonService();
    this.reviewService = new ReviewService();
  }
  
  public static getInstance(): SalonController {
    if (!SalonController.instance) {
      SalonController.instance = new SalonController();
    }
    return SalonController.instance;
  }

  // GET /salons/top?lat=...&lng=... (optionally with lat/lng)
  public getTopSalons() {
    return [
      validate(searchSalonsSchema),
      async (req: Request<{}, {}, {}, TopSalonsQuery>, res: Response) => {
        try {
          const { lat, lng } = req.query;
          const latitude = lat ? parseFloat(lat) : undefined;
          const longitude = lng ? parseFloat(lng) : undefined;
          
          const salons = await this.salonService.getTopSalons({
            latitude,
            longitude,
            reviewService: this.reviewService,
          });
          
          return res.json(salons);
        } catch (err: any) {
          return res.status(500).json({ 
            message: 'Error fetching top salons', 
            error: err.message 
          });
        }
      },
    ];
  }

  // GET /salons/search
  public searchSalons() {
    return [
      validate(searchSalonsSchema),
      async (req: Request<{}, {}, {}, z.infer<typeof searchSalonsSchema>>, res: Response) => {
        try {
          const filters = searchSalonsSchema.parse(req.query);
          const salons = await this.salonService.searchSalons(filters);
          return res.json(salons);
        } catch (err: any) {
          return res.status(500).json({ 
            message: 'Error fetching salons',
            error: err.message
          });
        }
      },
    ];
  }

  public async getSalonById(req: GetSalonByIdRequest, res: Response) {
    try {
      const salon = await this.salonService.getSalonById({ salonId: req.params.id });
      if (!salon) return res.status(404).json({ error: 'Salon not found' });
      return res.json(salon);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  public async createSalon(req: CreateSalonRequest, res: Response) {
    try {
      const salon = await this.salonService.createSalon(req.body);
      return res.status(201).json(salon);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  public async updateSalon(req: UpdateSalonRequest, res: Response) {
    try {
      const params = { 
        salonId: req.params.id, 
        ...req.body 
      };
      const salon = await this.salonService.updateSalon(params);
      if (!salon) return res.status(404).json({ error: 'Salon not found' });
      return res.json(salon);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  public async deleteSalon(req: DeleteSalonRequest, res: Response) {
    try {
      const deleted = await this.salonService.deleteSalon({ salonId: req.params.id });
      return res.json({ deleted });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}

// Export a singleton instance
export const salonController = SalonController.getInstance();
