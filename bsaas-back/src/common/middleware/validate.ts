import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(
  schema: ZodSchema<any>,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res
        .status(400)
        .json({
          code: 'error.validation',
          message: result.error.errors.map((e) => e.message).join(', '),
        });
      return;
    }
    req.body = result.data;
    next();
  };
}
