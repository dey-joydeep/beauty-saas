import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpException, 
  HttpStatus, 
  Logger 
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: any;
  isOperational: boolean;

  constructor(
    message: string, 
    statusCode: number = 500, 
    code: string = 'error.general',
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Handle 404 Not Found for undefined routes
    if (request && response && !response.headersSent) {
      const url = request.originalUrl || request.url;
      if (url && !url.startsWith('/api/')) {
        // For non-API routes, serve the main app (useful for SPAs)
        // This assumes you have a static files middleware set up to serve your frontend
        return response.sendFile('index.html', { root: 'public' });
      }
    }
    
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'error.general';
    let message = 'An unexpected error occurred';
    let details: any = undefined;

    // Handle different types of errors
    if (exception instanceof AppError) {
      statusCode = exception.statusCode;
      code = exception.code;
      message = exception.message;
      details = exception.details;
    } 
    else if (exception instanceof ZodError) {
      // Validation errors from Zod
      statusCode = HttpStatus.BAD_REQUEST;
      code = 'error.validation';
      message = 'Validation failed';
      details = exception.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));
    }
    else if (exception instanceof JsonWebTokenError) {
      statusCode = HttpStatus.UNAUTHORIZED;
      code = 'error.invalid_token';
      message = 'Invalid authentication token';
    }
    else if (exception instanceof TokenExpiredError) {
      statusCode = HttpStatus.UNAUTHORIZED;
      code = 'error.token_expired';
      message = 'Authentication token has expired';
    }
    else if (exception instanceof HttpException) {
      // NestJS HttpException
      statusCode = exception.getStatus();
      const response = exception.getResponse();
      
      if (typeof response === 'object' && response !== null) {
        // If the response is an object, use its properties
        const res = response as Record<string, unknown>;
        message = (res['message'] as string) || exception.message;
        code = (res['code'] as string) || `error.http.${statusCode}`;
        details = res['details'];
      } else {
        // If the response is a string, use it as the message
        message = exception.message;
        code = `error.http.${statusCode}`;
      }
    }
    else if (exception instanceof Error) {
      // Generic JavaScript error
      message = exception.message;
      code = 'error.runtime';
    }

    // Log the error for debugging
    this.logger.error(
      `Error: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
      'ExceptionFilter',
    );

    // Send the error response
    response.status(statusCode).json({
      success: false,
      statusCode,
      code,
      message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

export default HttpExceptionFilter;
