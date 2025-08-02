import { Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { DashboardService } from './dashboard.service';
import {
  ProductSalesFilterDto,
  ProductSaleDto,
  ProductSalesSummaryDto,
} from './dto/product-sales.dto';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

const dashboardService = new DashboardService();

// Helper function to validate DTOs
async function validateDto<T extends object>(dto: new () => T, data: any): Promise<T> {
  const dtoInstance = plainToInstance(dto, data);
  await validateOrReject(dtoInstance, { whitelist: true, forbidNonWhitelisted: true });
  return dtoInstance;
}

export const getDashboardStats = [
  authenticateJWT,
  requireRole(['admin', 'owner']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await dashboardService.getStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
];

export const getSubscriptions = [
  authenticateJWT,
  requireRole(['admin', 'owner']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subscriptions = await dashboardService.getSubscriptions();
      res.json(subscriptions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
];

export const getRevenue = [
  authenticateJWT,
  requireRole(['admin', 'owner']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const revenue = await dashboardService.getRevenue();
      res.json(revenue);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
];

export const getRenewals = [
  authenticateJWT,
  requireRole(['admin', 'owner']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const renewals = await dashboardService.getRenewals();
      res.json(renewals);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
];

export const getProductSales = [
  authenticateJWT,
  requireRole(['admin', 'owner', 'staff']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Convert query parameters to proper types
      const filters = await validateDto(ProductSalesFilterDto, req.query);
      const sales = await dashboardService.getProductSales(filters);
      res.json(sales);
    } catch (err: any) {
      if (Array.isArray(err) && err.length > 0) {
        // This is a validation error from class-validator
        res.status(400).json({
          error: 'Validation failed',
          details: err.map((e: any) => ({
            property: e.property,
            constraints: e.constraints,
          })),
        });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  },
];

export const getProductSalesSummary = [
  authenticateJWT,
  requireRole(['admin', 'owner']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = await validateDto(ProductSalesFilterDto, req.query);
      const summary = await dashboardService.getProductSalesSummary(filters);
      res.json(summary);
    } catch (err: any) {
      if (Array.isArray(err) && err.length > 0) {
        res.status(400).json({
          error: 'Validation failed',
          details: err.map((e: any) => ({
            property: e.property,
            constraints: e.constraints,
          })),
        });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  },
];

export const getTopSellingProducts = [
  authenticateJWT,
  requireRole(['admin', 'owner', 'staff']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
      const products = await dashboardService.getTopSellingProducts(limit);
      res.json(products);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
];
