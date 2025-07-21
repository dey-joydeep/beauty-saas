import { Request, Response, NextFunction } from 'express';
import i18next from 'i18next';

export class AppError extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 500, code = 'error.general') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  try {
    console.error('Express errorHandler:', err);
    const lang = req.language || req.headers['accept-language']?.split(',')[0] || 'en';
    const code = err.code || 'error.general';
    const status = err.status || 500;
    const message = i18next.t(code, {
      lng: lang,
      defaultValue: err.message || 'An error occurred.',
    });
    if (res.headersSent) {
      return next(err);
    }
    res.status(status).json({ code, message });
  } catch (handlerError) {
    // Fallback: ensure a response is always sent
    if (!res.headersSent) {
      res.status(500).json({ code: 'error.general', message: 'An error occurred.' });
    }
  }
}
