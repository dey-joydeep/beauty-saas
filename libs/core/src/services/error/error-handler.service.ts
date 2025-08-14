import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ErrorService } from './error.service';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService implements ErrorHandler {
  private isBrowser: boolean;

  private readonly platformId: Object;

  constructor(
    platformId: Object,
    private errorService: ErrorService
  ) {
    this.platformId = platformId;
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  handleError(error: Error | HttpErrorResponse): void {
    // Always log the error to the console
    console.error('Error occurred:', error);

    // Handle HTTP errors
    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
    } 
    // Handle client-side errors
    else if (error instanceof Error) {
      this.handleClientError(error);
    }
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
