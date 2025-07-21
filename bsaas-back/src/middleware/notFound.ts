import { Request, Response, NextFunction } from 'express';
export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({ code: 'error.not_found', message: 'Resource not found.' });
}
