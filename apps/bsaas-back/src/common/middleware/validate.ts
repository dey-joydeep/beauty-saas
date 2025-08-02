import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

export function validate(
  schema: ZodSchema<any>,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const error = result.error;
      res.status(400).json({
        code: 'error.validation',
        message: error.issues.map((issue) => issue.message).join(', '),
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
