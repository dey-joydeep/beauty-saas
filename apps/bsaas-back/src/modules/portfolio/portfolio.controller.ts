import { Request, Response } from 'express';
import { PortfolioService } from './portfolio.service';
import type {
  GetPortfoliosParams,
  CreatePortfolioParams,
  UpdatePortfolioParams,
  DeletePortfolioParams,
  GetPortfolioByIdParams,
} from './portfolio-params.model';
import { authenticateJWT } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { createPortfolioSchema, updatePortfolioSchema } from './portfolio.validation';
import type { NextFunction } from 'express';

const portfolioService = new PortfolioService();

function withAuthAndRole(
  roles: string[],
  handler: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) {
  return [authenticateJWT, requireRole(roles), handler];
}

export const getPortfolios = withAuthAndRole(
  ['admin', 'owner', 'staff', 'customer'],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params: GetPortfoliosParams = { filter: req.query };
      // Not implemented in service, just return empty array for now
      res.json([]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
);

export const createPortfolio = [
  authenticateJWT,
  requireRole(['owner', 'staff']),
  validate(createPortfolioSchema),
  async (req: Request, res: Response) => {
    try {
      const params: CreatePortfolioParams = { data: req.body };
      const portfolio = await portfolioService.createPortfolio(params);
      res.status(201).json(portfolio);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
];

export const updatePortfolio = [
  authenticateJWT,
  requireRole(['owner', 'staff']),
  validate(updatePortfolioSchema),
  async (req: Request, res: Response) => {
    try {
      const params: UpdatePortfolioParams = { id: req.params.id, data: req.body };
      const portfolio = await portfolioService.updatePortfolio(params);
      res.json(portfolio);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
];

export const deletePortfolio = withAuthAndRole(
  ['admin', 'owner'],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params: DeletePortfolioParams = { id: req.params.id };
      await portfolioService.deletePortfolio(params.id);
      res.status(204).end();
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
);

export const getPortfolioById = withAuthAndRole(
  ['admin', 'owner', 'staff', 'customer'],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params: GetPortfolioByIdParams = { id: req.params.id };
      const portfolio = await portfolioService.getPortfolioById(params);
      if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });
      res.json(portfolio);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
);
