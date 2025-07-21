import { z } from 'zod';

export const searchSalonsSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  zip_code: z.string().optional(),
  city: z.string().optional(),
  service: z.string().optional(),
  min_rating: z.preprocess(
    (val) => (val === undefined ? undefined : Number(val)),
    z.number().min(0).max(5).optional(),
  ),
  max_rating: z.preprocess(
    (val) => (val === undefined ? undefined : Number(val)),
    z.number().min(0).max(5).optional(),
  ),
  page: z.preprocess(
    (val) => (val === undefined ? undefined : Number(val)),
    z.number().min(1).optional(),
  ),
  page_size: z.preprocess(
    (val) => (val === undefined ? undefined : Number(val)),
    z.number().min(1).max(100).optional(),
  ),
  sort: z.string().optional(),
});
