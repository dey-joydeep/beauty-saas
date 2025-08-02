import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  PERMISSION = 'PERMISSION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface ErrorState {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private errorSubject = new BehaviorSubject<ErrorState | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private translate: TranslateService) {}

  /**
   * Handle an error and return user-friendly message
   * @param error The error to handle
   * @param context Optional context for error handling
   */
  handleError(error: any, context?: string): string {
    const message = this.getErrorMessage(error);
    this.setErrorState({
      type: this.getErrorType(error),
      message: context ? `${context}: ${message}` : message,
      details: error,
      timestamp: new Date(),
    });
    return message;
  }

  /**
   * Get a user-friendly error message
   * @param error The error to format
   */
  getErrorMessage(error: any): string {
    if (error instanceof HttpErrorResponse) {
      return this.handleHttpError(error);
    }
    return this.getGenericErrorMessage(error);
  }

  private handleHttpError(error: HttpErrorResponse): string {
    let userMessage = '';

    switch (error.status) {
      case 0:
        userMessage = this.translate.instant('errors.network');
        break;

      case 400:
        userMessage = error.error?.message || this.translate.instant('errors.badRequest');
        break;

      case 401:
        userMessage = this.translate.instant('errors.unauthorized');
        break;

      case 403:
        userMessage = this.translate.instant('errors.forbidden');
        break;

      case 404:
        userMessage = this.translate.instant('errors.notFound');
        break;

      case 422:
        userMessage = error.error?.message || this.translate.instant('errors.validation');
        break;

      default:
        if (error.status >= 500) {
          userMessage = this.translate.instant('errors.serverError');
        } else {
          userMessage = error.error?.message || this.translate.instant('errors.unknown');
        }
        break;
    }

    return userMessage;
  }

  private getGenericErrorMessage(error: any): string {
    const message = error?.message || error?.error?.message || error?.toString() || this.translate.instant('errors.unknown');
    return message;
  }

  /**
   * Clear any existing error state
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Get the current error state
   */
  getCurrentError(): ErrorState | null {
    return this.errorSubject.value;
  }

  /**
   * Set a custom error state
   * @param errorState The error state to set
   */
  setErrorState(errorState: ErrorState): void {
    this.errorSubject.next(errorState);
  }

  /**
   * Get error type based on error characteristics
   * @param error The error to classify
   */
  private getErrorType(error: any): ErrorType {
    if (error.status === 0) return ErrorType.NETWORK;
    if (error.status === 401) return ErrorType.AUTH;
    if (error.status === 403) return ErrorType.PERMISSION;
    if (error.status === 422) return ErrorType.VALIDATION;
    if (error.status >= 500) return ErrorType.SERVER;
    return ErrorType.UNKNOWN;
  }
}
