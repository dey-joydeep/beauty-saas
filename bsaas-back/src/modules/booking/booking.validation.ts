import { z } from 'zod';
import { isISODateString, isTimeString } from '../../utils/validators';

export const createBookingSchema = z.object({
  salonId: z.string().min(1, 'salonId is required'),
  userId: z.string().min(1, 'userId is required'),
  serviceId: z.string().min(1, 'serviceId is required'),
  date: z
    .string()
    .refine(isISODateString, {
      message: 'date must be a valid ISO date string (YYYY-MM-DD or ISO 8601)',
    }),
  time: z.string().refine(isTimeString, { message: 'time must be in HH:mm or HH:mm:ss format' }),
  status: z.string().min(1, 'status is required'),
  staffId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updateBookingSchema = z
  .object({
    salonId: z.string().min(1).optional(),
    userId: z.string().min(1).optional(),
    serviceId: z.string().min(1).optional(),
    date: z
      .string()
      .optional()
      .refine((val) => !val || isISODateString(val), {
        message: 'date must be a valid ISO date string (YYYY-MM-DD or ISO 8601)',
      }),
    time: z
      .string()
      .optional()
      .refine((val) => !val || isTimeString(val), {
        message: 'time must be in HH:mm or HH:mm:ss format',
      }),
    status: z.string().min(1).optional(),
    staffId: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });
