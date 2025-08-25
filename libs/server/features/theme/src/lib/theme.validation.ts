import { z } from 'zod';
import { isISODateString } from '../../utils/validators';

export const createThemeSchema = z.object({
  name: z.string().min(1, 'Theme name is required'),
  colors: z.record(z.string(), z.string()).refine((obj) => Object.keys(obj).length > 0, { message: 'At least one color is required' }),
  isActive: z.boolean(),
  createdAt: z
    .string()
    .optional()
    .refine((val) => !val || isISODateString(val), {
      message: 'createdAt must be a valid ISO date string',
    }),
  updatedAt: z
    .string()
    .optional()
    .refine((val) => !val || isISODateString(val), {
      message: 'updatedAt must be a valid ISO date string',
    }),
});

export const updateThemeSchema = z
  .object({
    name: z.string().min(1, 'Theme name is required').optional(),
    colors: z.record(z.string(), z.string()).optional(),
    isActive: z.boolean().optional(),
    updatedAt: z
      .string()
      .optional()
      .refine((val) => !val || isISODateString(val), {
        message: 'updatedAt must be a valid ISO date string',
      }),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });
