import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth';
import { PortfolioService } from './portfolio.service';
import { 
  GetPortfoliosParams, 
  CreatePortfolioParams, 
  UpdatePortfolioParams,
  GetPortfolioByIdParams,
  DeletePortfolioParams
} from './portfolio-params.model';
import { authenticateJWT } from '../../common/middleware/auth';
import { requireRole } from '../../common/middleware/requireRole';
import { validate } from '../../common/middleware/validate';
import { createPortfolioSchema, updatePortfolioSchema } from './portfolio.validation';
import { ApiResponse } from '../../types/api.types';

const portfolioService = new PortfolioService();

// Helper function to create success response
function createSuccessResponse<T>(data: T, message: string = 'Success'): ApiResponse<T> {
  return {
    success: true,
    code: 'success',
    message,
    data,
    status: 200
  };
}

// Helper function to create error response
function createErrorResponse(code: string, message: string, status: number): ApiResponse<null> {
  return {
    success: false,
    code,
    message,
    data: null,
    status
  };
}

// Type for our middleware handlers
type MiddlewareHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<unknown> | unknown;

// Helper to create authenticated routes with role checks
function withAuthAndRole(roles: string[], handler: MiddlewareHandler): MiddlewareHandler[] {
  return [
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const result = authenticateJWT(req, res, next);
      return result === undefined ? undefined : Promise.resolve(result);
    },
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const result = requireRole(roles)(req, res, next);
      return result === undefined ? undefined : Promise.resolve(result);
    },
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        await handler(req, res, next);
      } catch (error) {
        next(error);
      }
    }
  ];
}

// Get all portfolios
export const getPortfolios: MiddlewareHandler[] = [
  ...withAuthAndRole(
    ['admin', 'owner', 'staff', 'customer'],
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const params: GetPortfoliosParams = { filter: req.query };
        // Not implemented in service, just return empty array for now
        res.status(200).json(createSuccessResponse([], 'Portfolios retrieved successfully'));
      } catch (err: any) {
        res.status(500).json(createErrorResponse('internal_error', err.message, 500));
      }
    }
  )
];

// Create a new portfolio
export const createPortfolio: MiddlewareHandler[] = [
  ...withAuthAndRole(
    ['owner', 'staff'],
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        if (!req.user?.id) {
          return res.status(401).json(
            createErrorResponse('unauthorized', 'User not authenticated', 401)
          );
        }

        const params: CreatePortfolioParams = { 
          data: {
            ...req.body,
            userId: req.user.id
          },
          userId: req.user.id
        };
        
        const portfolio = await portfolioService.createPortfolio(params);
        return res.status(201).json(
          createSuccessResponse(portfolio, 'Portfolio created successfully')
        );
      } catch (err: any) {
        return res.status(400).json(
          createErrorResponse('bad_request', err.message, 400)
        );
      }
    }
  ),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const result = validate(createPortfolioSchema)(req, res, next);
    return result === undefined ? undefined : Promise.resolve(result);
  }
];

// Update a portfolio
export const updatePortfolio: MiddlewareHandler[] = [
  ...withAuthAndRole(
    ['owner', 'staff'],
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const portfolioId = req.params?.['id'];
        if (!portfolioId) {
          return res.status(400).json(
            createErrorResponse('bad_request', 'Portfolio ID is required', 400)
          );
        }

        if (!req.user?.id) {
          return res.status(401).json(
            createErrorResponse('unauthorized', 'User not authenticated', 401)
          );
        }

        const params: UpdatePortfolioParams = {
          id: portfolioId,
          data: req.body,
          userId: req.user.id
        };
        
        const portfolio = await portfolioService.updatePortfolio(params);
        return res.status(200).json(
          createSuccessResponse(portfolio, 'Portfolio updated successfully')
        );
      } catch (err: any) {
        return res.status(400).json(
          createErrorResponse('bad_request', err.message, 400)
        );
      }
    }
  ),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const result = validate(updatePortfolioSchema)(req, res, next);
    return result === undefined ? undefined : Promise.resolve(result);
  }
];

// Delete a portfolio
export const deletePortfolio: MiddlewareHandler[] = [
  ...withAuthAndRole(
    ['admin', 'owner'],
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const portfolioId = req.params?.['id'];
        if (!portfolioId) {
          return res.status(400).json(
            createErrorResponse('bad_request', 'Portfolio ID is required', 400)
          );
        }

        if (!req.user?.id) {
          return res.status(401).json(
            createErrorResponse('unauthorized', 'User not authenticated', 401)
          );
        }
        
        await portfolioService.deletePortfolio({
          id: portfolioId,
          userId: req.user.id
        });
        
        return res.status(204).end();
      } catch (err: any) {
        return res.status(400).json(
          createErrorResponse('bad_request', err.message, 400)
        );
      }
    }
  )
];

// Get portfolio by ID
export const getPortfolioById: MiddlewareHandler[] = [
  ...withAuthAndRole(
    ['admin', 'owner', 'staff', 'customer'],
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const portfolioId = req.params?.['id'];
        if (!portfolioId) {
          return res.status(400).json(
            createErrorResponse('bad_request', 'Portfolio ID is required', 400)
          );
        }
        
        const portfolio = await portfolioService.getPortfolioById({
          id: portfolioId,
          userId: req.user?.id
        });
        
        if (!portfolio) {
          return res.status(404).json(
            createErrorResponse('not_found', 'Portfolio not found', 404)
          );
        }
        
        return res.status(200).json(
          createSuccessResponse(portfolio, 'Portfolio retrieved successfully')
        );
      } catch (err: any) {
        return res.status(400).json(
          createErrorResponse('bad_request', err.message, 400)
        );
      }
    }
  )
];
