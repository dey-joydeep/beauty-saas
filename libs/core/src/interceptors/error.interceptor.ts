import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Injectable, Provider } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';

/**
 * Global HTTP error interceptor that handles all HTTP errors
 * and shows appropriate user notifications.
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle different types of errors
        if (error.status === 0) {
          // Network error
          this.handleNetworkError(req);
        } else if (error.status >= 400 && error.status < 500) {
          // Client error (4xx)
          this.handleClientError(error, req);
        } else if (error.status >= 500) {
          // Server error (5xx)
          this.handleServerError(error, req);
        } else {
          // Other errors
          this.handleUnexpectedError(error, req);
        }

        // Log the error for debugging
        this.logError(error, req);

        // Re-throw the error to be handled by the service
        return throwError(() => error);
      })
    );
  }

  private handleNetworkError(req: HttpRequest<unknown>): void {
    this.notificationService.showError(
      'Unable to connect to the server. Please check your internet connection and try again.'
    );
  }

  private handleClientError(error: HttpErrorResponse, req: HttpRequest<unknown>): void {
    const errorResponse = error.error;
    let userMessage = 'An error occurred';

    if (error.status === 401) {
      // Unauthorized - redirect to login
      userMessage = 'Your session has expired. Please log in again.';
      this.router.navigate(['/auth/login']);
    } else if (error.status === 403) {
      // Forbidden
      userMessage = 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      // Not Found
      userMessage = 'The requested resource was not found.';
    } else if (errorResponse?.message) {
      // Use server-provided message if available
      userMessage = errorResponse.message;
    } else {
      // Generic client error
      userMessage = 'There was a problem with your request. Please try again.';
    }

    this.notificationService.showError(userMessage);
  }

  private handleServerError(error: HttpErrorResponse, req: HttpRequest<unknown>): void {
    const errorResponse = error.error;
    const serverMessage = errorResponse?.message || 'A server error occurred';
    
    // Log detailed error for debugging
    console.error('Server Error:', {
      url: req.url,
      status: error.status,
      message: serverMessage,
      error: errorResponse,
    });

    // Show user-friendly message
    this.notificationService.showError(
      'We encountered an issue processing your request. Our team has been notified.'
    );
  }

  private handleUnexpectedError(error: HttpErrorResponse, req: HttpRequest<unknown>): void {
    console.error('Unexpected Error:', {
      url: req.url,
      error,
    });

    this.notificationService.showError(
      'An unexpected error occurred. Please try again later.'
    );
  }

  private logError(error: HttpErrorResponse, req: HttpRequest<unknown>): void {
    console.error('HTTP Error:', {
      url: req.url,
      method: req.method,
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      error: error.error,
    });
  }
}

/**
 * Provider for the ErrorInterceptor.
 */
export const ERROR_INTERCEPTOR_PROVIDER: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: ErrorInterceptor,
  multi: true,
};
