import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CreateBookingParams } from '../../models/booking-params.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = '/api/booking';

  constructor(private http: HttpClient) {}

  createBooking(params: CreateBookingParams): Observable<any> {
    const payload = {
      userId: params.userId,
      salonId: params.salonId,
      services: params.services,
      staffId: params.staffId,
      date: params.date,
      note: params.note
    };
    return this.http.post(`${this.apiUrl}/bookings`, payload).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  saveBooking(data: CreateBookingParams): Observable<{ success: boolean }> {
    const payload = {
      userId: data.userId,
      salonId: data.salonId,
      services: data.services,
      staffId: data.staffId,
      date: data.date,
      note: data.note
    };
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/save`, payload).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  private handleError(err: any) {
    let userMessage = 'An error occurred.';
    if (err.status === 404) {
      userMessage = 'Booking not found.';
    } else if (err.status === 401) {
      userMessage = 'You are not authorized. Please log in again.';
    } else if (err.status === 403) {
      userMessage = 'You do not have permission to perform this action.';
    } else if (err.status === 400) {
      userMessage = err.error?.error || 'Bad request.';
    } else if (err.error?.error) {
      userMessage = err.error.error;
    }
    return throwError(() => ({ ...err, userMessage }));
  }
}
