import { Request, Response } from 'express';
import { ThemeService } from './theme.service';
import type {
  GetThemesParams,
  CreateThemeParams,
  UpdateThemeParams,
  DeleteThemeParams,
  GetThemeByIdParams,
} from './theme-params.model';
import { authenticateJWT } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { createThemeSchema, updateThemeSchema } from './theme.validation';
import type { NextFunction } from 'express';

const themeService = new ThemeService();

function withAuthAndRole(
  roles: string[],
  handler: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) {
  return [authenticateJWT, requireRole(roles), handler];
}

export const getThemes = withAuthAndRole(
  ['admin', 'owner', 'staff', 'customer'],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params: GetThemesParams = { filter: req.query };
      res.json([]); // Not implemented in service
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
);

export const createTheme = [
  authenticateJWT,
  requireRole(['admin']),
  validate(createThemeSchema),
  async (req: Request, res: Response) => {
    try {
      const params: CreateThemeParams = { data: req.body };
      const theme = await themeService.createTheme(params);
      res.status(201).json(theme);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
];

export const updateTheme = [
  authenticateJWT,
  requireRole(['admin']),
  validate(updateThemeSchema),
  async (req: Request, res: Response) => {
    try {
      const params: UpdateThemeParams = { id: req.params.id, data: req.body };
      const theme = await themeService.updateTheme(params);
      res.json(theme);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
];

export const deleteTheme = withAuthAndRole(
  ['admin'],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params: DeleteThemeParams = { id: req.params.id };
      await themeService.deleteTheme(params);
      res.status(204).end();
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
);

export const getThemeById = withAuthAndRole(
  ['admin', 'owner', 'staff', 'customer'],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params: GetThemeByIdParams = { id: req.params.id };
      const theme = await themeService.getThemeById(params);
      if (!theme) return res.status(404).json({ error: 'Theme not found' });
      res.json(theme);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
);
