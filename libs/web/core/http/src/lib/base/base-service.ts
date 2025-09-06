import { HttpClient } from '@angular/common/http';
import { inject, Inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

export abstract class BaseService {
  protected abstract readonly baseUrl: string;
  protected readonly http = inject(HttpClient);

  constructor(@Inject('API_BASE_URL') protected apiBaseUrl: string) {}

  protected getFullUrl(endpoint: string): string {
    return `${this.apiBaseUrl}${this.baseUrl}${endpoint}`;
  }

  protected handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => error);
  }

  protected get<T>(url: string): Observable<T> {
    return this.http.get<T>(this.getFullUrl(url)).pipe(catchError(this.handleError));
  }

  protected post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(this.getFullUrl(url), body).pipe(catchError(this.handleError));
  }

  protected put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(this.getFullUrl(url), body).pipe(catchError(this.handleError));
  }

  protected delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(this.getFullUrl(url)).pipe(catchError(this.handleError));
  }
}
