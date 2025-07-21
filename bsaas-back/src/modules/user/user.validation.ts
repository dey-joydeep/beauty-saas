import { z } from 'zod';
import { isEmail, isPhoneNumber } from '../../utils/validators';

export const registerUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z
    .string()
    .email('Invalid email address')
    .refine(isEmail, { message: 'Invalid email format' }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  tenantId: z.string().min(1, 'tenantId is required'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || isPhoneNumber(val), { message: 'Invalid phone number' }),
  roles: z.array(z.string()).optional(),
  isVerified: z.boolean().optional(),
  saasOwner: z.boolean().optional(),
  salonStaff: z.boolean().optional(),
  customer: z.boolean().optional(),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z
      .string()
      .email()
      .optional()
      .refine((val) => !val || isEmail(val), { message: 'Invalid email format' }),
    password: z.string().min(6).optional(),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || isPhoneNumber(val), { message: 'Invalid phone number' }),
    roles: z.array(z.string()).optional(),
    isVerified: z.boolean().optional(),
    saasOwner: z.boolean().optional(),
    salonStaff: z.boolean().optional(),
    customer: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });
