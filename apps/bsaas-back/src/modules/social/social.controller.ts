import { Request, Response } from 'express';
import {
  SocialService,
  UpdateSocialParams,
  DeleteSocialParams,
  GetSocialByIdParams,
} from './social.service';
import { authenticateJWT } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { createSocialSchema, updateSocialSchema } from './social.validation';

const socialService = new SocialService();

export const createSocial = [
  authenticateJWT,
  requireRole(['owner', 'admin', 'customer']),
  validate(createSocialSchema),
  async (req: Request, res: Response) => {
    try {
      const result = await socialService.createSocial(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
];

export const updateSocial = [
  authenticateJWT,
  requireRole(['owner', 'admin', 'customer']),
  validate(updateSocialSchema),
  async (req: Request, res: Response) => {
    try {
      const params: UpdateSocialParams = { id: req.params.id, data: req.body };
      const result = await socialService.updateSocial(params);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
];

export const deleteSocial = [
  authenticateJWT,
  requireRole(['owner', 'admin', 'customer']),
  async (req: Request, res: Response) => {
    try {
      const params: DeleteSocialParams = { id: req.params.id };
      await socialService.deleteSocial(params);
      res.status(204).send();
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
];

export const googleLogin = (req: Request, res: Response) => {
  // Implementation for Google OAuth login
  res.status(200).json({ message: 'Google login endpoint' });
};

export const facebookLogin = (req: Request, res: Response) => {
  // Implementation for Facebook OAuth login
  res.status(200).json({ message: 'Facebook login endpoint' });
};

export const getSocialById = [
  authenticateJWT,
  requireRole(['owner', 'admin', 'customer']),
  async (req: Request, res: Response) => {
    try {
      const params: GetSocialByIdParams = { id: req.params.id };
      const result = await socialService.getSocialById(params);
      res.json(result);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  },
];

export const getAllSocials = [
  authenticateJWT,
  requireRole(['owner', 'admin', 'customer']),
  async (req: Request, res: Response) => {
    try {
      const result = await socialService.getSocials(req.query);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
];
