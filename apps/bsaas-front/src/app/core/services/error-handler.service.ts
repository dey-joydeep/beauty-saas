import { ErrorHandler, Injectable, Inject, PLATFORM_ID, Optional } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService implements ErrorHandler {
  private isBrowser = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  handleError(error: Error | HttpErrorResponse): void {
    // Always log the error to the console
    console.error('Error occurred:', error);

    // In a real app, you might want to send errors to a logging service
    // For now, we'll just log to console
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        console.error('Network error: Unable to connect to the server');
      } else if (error.status >= 400 && error.status < 500) {
        console.error(`Client error (${error.status}):`, error.message || 'Unknown error');
      } else if (error.status >= 500) {
        console.error('Server error: Please try again later');
      }
    }
  }
}
