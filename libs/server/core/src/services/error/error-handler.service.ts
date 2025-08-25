import { Injectable } from '@nestjs/common';
import { ErrorService } from './error.service';

export interface HttpErrorResponse {
  status: number;
  statusText: string;
  message: string;
  error?: any;
}

@Injectable()
export class ErrorHandlerService {
  constructor(private errorService: ErrorService) {}

  handleError(error: Error | HttpErrorResponse): void {
    // Always log the error to the console
    console.error('Error occurred:', error);

    // Handle HTTP errors
    if (this.isHttpErrorResponse(error)) {
      this.handleHttpError(error);
    }
    // Handle client-side errors
    else if (error instanceof Error) {
      this.handleClientError(error);
    }
  }

  private isHttpErrorResponse(error: any): error is HttpErrorResponse {
    return error && typeof error.status === 'number' && error.statusText && error.message;
  }

  private handleHttpError(error: HttpErrorResponse): void {
    // Delegate to ErrorService for HTTP errors
    this.errorService.handleError(error, 'HTTP');
  }

  private handleClientError(error: Error): void {
    // Delegate to ErrorService for client-side errors
    this.errorService.handleError(error, 'Client');
  }
}
