import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Injectable, Provider } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';

@Injectable({ providedIn: 'root' })
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly router: Router,
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          this.notificationService.showError('Unable to connect to the server. Please check your internet connection and try again.');
        } else if (error.status >= 400 && error.status < 500) {
          if (error.status === 401) {
            this.notificationService.showError('Your session has expired. Please log in again.');
            this.router.navigate(['/auth/login']);
          } else if (error.status === 403) {
            this.notificationService.showError('You do not have permission to perform this action.');
          } else if (error.status === 404) {
            this.notificationService.showError('The requested resource was not found.');
          } else {
            this.notificationService.showError(error.error?.message || 'There was a problem with your request.');
          }
        } else if (error.status >= 500) {
          console.error('Server Error:', {
            url: req.url,
            status: error.status,
            message: error.error?.message || 'A server error occurred',
            error: error.error,
          });
          this.notificationService.showError('We encountered an issue processing your request. Our team has been notified.');
        } else {
          console.error('Unexpected Error:', { url: req.url, error });
          this.notificationService.showError('An unexpected error occurred. Please try again later.');
        }

        return throwError(() => error);
      }),
    );
  }
}

export const ERROR_INTERCEPTOR_PROVIDER: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: ErrorInterceptor,
  multi: true,
};
