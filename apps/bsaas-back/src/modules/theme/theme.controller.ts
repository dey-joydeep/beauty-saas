import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ThemeService } from './theme.service';
import { 
  GetThemesParams,
  CreateThemeParams,
  UpdateThemeParams,
  DeleteThemeParams,
  GetThemeByIdParams,
} from './theme-params.model';
import { authenticateJWT } from '../../common/middleware/auth';
import { requireRole } from '../../common/middleware/requireRole';
import { validate } from '../../common/middleware/validate';
import { createThemeSchema, updateThemeSchema } from './theme.validation';
import { ApiResponse } from '../../types/api.types';
import { AuthenticatedRequest } from '../../common/middleware/auth';

// Extended RequestHandler type that properly handles async/await
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

// Helper type for middleware that might return a response
type MiddlewareHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown> | unknown;

const themeService = new ThemeService();

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

/**
 * Middleware factory for routes that require authentication and specific roles
 */
function withAuthAndRole(
  roles: string[],
  handler: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void> | void
): MiddlewareHandler[] {
  return [
    (req, res, next) => {
      const result = authenticateJWT(req as AuthenticatedRequest, res, next);
      return result === undefined ? undefined : Promise.resolve(result);
    },
    (req, res, next) => {
      const result = requireRole(roles)(req as AuthenticatedRequest, res, next);
      return result === undefined ? undefined : Promise.resolve(result);
    },
    async (req, res, next) => {
      try {
        await handler(req as AuthenticatedRequest, res, next);
      } catch (error) {
        next(error);
      }
    }
  ] as MiddlewareHandler[];
}

/**
 * Get all themes with optional filtering
 */
export const getThemes = withAuthAndRole(
  ['admin', 'owner', 'staff', 'customer'],
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const params: GetThemesParams = { filter: req.query };
      const themes = await themeService.getThemes(params);
      
      const response = createSuccessResponse(themes, 'Themes retrieved successfully');
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Create a new theme (admin only)
 */
export const createTheme: MiddlewareHandler[] = [
  (req, res, next) => {
    const result = authenticateJWT(req as AuthenticatedRequest, res, next);
    return result === undefined ? undefined : Promise.resolve(result);
  },
  (req, res, next) => {
    const result = requireRole(['admin'])(req as AuthenticatedRequest, res, next);
    return result === undefined ? undefined : Promise.resolve(result);
  },
  (req, res, next) => {
    const result = validate(createThemeSchema, 'body')(req, res, next);
    return result === undefined ? undefined : Promise.resolve(result);
  },
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params: CreateThemeParams = { 
        data: req.body
      };
      
      const theme = await themeService.createTheme(params);
      
      const response = createSuccessResponse(theme, 'Theme created successfully');
      response.status = 201;
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
];

/**
 * Update an existing theme (admin only)
 */
export const updateTheme: MiddlewareHandler[] = [
  (req, res, next) => {
    const result = authenticateJWT(req as AuthenticatedRequest, res, next);
    return result === undefined ? undefined : Promise.resolve(result);
  },
  (req, res, next) => {
    const result = requireRole(['admin'])(req as AuthenticatedRequest, res, next);
    return result === undefined ? undefined : Promise.resolve(result);
  },
  (req, res, next) => {
    const result = validate(updateThemeSchema, 'body')(req, res, next);
    return result === undefined ? undefined : Promise.resolve(result);
  },
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const themeId = req.params['id'];
      if (!themeId) {
        const response = createErrorResponse('error.invalid_id', 'Theme ID is required', 400);
        res.status(400).json(response);
        return;
      }
      
      const params: UpdateThemeParams = { 
        id: themeId,
        data: req.body
      };
      
      const theme = await themeService.updateTheme(params);
      
      if (!theme) {
        const response = createErrorResponse('error.not_found', 'Theme not found', 404);
        res.status(404).json(response);
        return;
      }
      
      const response = createSuccessResponse(theme, 'Theme updated successfully');
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
];

/**
 * Delete a theme (admin only)
 */
export const deleteTheme = withAuthAndRole(
  ['admin'],
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const themeId = req.params['id'];
      if (!themeId) {
        const response = createErrorResponse('error.invalid_id', 'Theme ID is required', 400);
        res.status(400).json(response);
        return;
      }
      
      const params: DeleteThemeParams = { 
        id: themeId
      };
      
      await themeService.deleteTheme(params);
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get a single theme by ID
 */
export const getThemeById = withAuthAndRole(
  ['admin', 'owner', 'staff', 'customer'],
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const themeId = req.params['id'];
      if (!themeId) {
        const response = createErrorResponse('error.invalid_id', 'Theme ID is required', 400);
        res.status(400).json(response);
        return;
      }
      
      const params: GetThemeByIdParams = { id: themeId };
      const theme = await themeService.getThemeById(params);
      
      if (!theme) {
        const response = createErrorResponse('error.not_found', 'Theme not found', 404);
        res.status(404).json(response);
        return;
      }
      
      const response = createSuccessResponse(theme, 'Theme retrieved successfully');
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);
