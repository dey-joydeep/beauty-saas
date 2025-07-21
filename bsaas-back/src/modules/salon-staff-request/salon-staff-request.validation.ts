import { z } from 'zod';

export const createSalonStaffRequestSchema = z.object({
  salonId: z.string().min(1, 'salonId is required'),
  userId: z.string().min(1, 'userId is required'),
  message: z.string().min(1, 'Message is required'),
  status: z.string().min(1, 'Status is required'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const updateSalonStaffRequestSchema = z
  .object({
    message: z.string().min(1).optional(),
    status: z.string().min(1).optional(),
    updatedAt: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });
