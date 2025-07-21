import { z } from 'zod';
import { isISODateString } from '../../utils/validators';

export const createPortfolioSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  images: z
    .array(z.string().url('Each image must be a valid URL'))
    .min(1, 'At least one image is required'),
  description: z.string().min(1, 'Description is required'),
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

export const updatePortfolioSchema = z
  .object({
    images: z.array(z.string().url('Each image must be a valid URL')).optional(),
    description: z.string().min(1, 'Description is required').optional(),
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
