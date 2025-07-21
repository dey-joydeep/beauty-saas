import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { Booking, BookingRequest, BookingResponse, BookingListResponse } from '../../../models/booking.model';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  getBooking(id: string): Observable<Booking> {
    return this.http.get<BookingResponse>(`${this.apiUrl}/${id}`).pipe(
      map((response) => ({
        ...response,
        startTime: new Date(response.startTime),
        endTime: new Date(response.endTime),
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      })),
    );
  }

  rescheduleBooking(id: string, date: Date, time: string, notes?: string): Observable<Booking> {
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1); // Assuming 1 hour duration for now

    const request: BookingRequest = {
      startTime,
      endTime,
      notes,
      serviceId: '', // Will be set by the backend
      staffId: '', // Will be set by the backend
      salonId: '', // Will be set by the backend
    };

    return this.http.patch<BookingResponse>(`${this.apiUrl}/${id}/reschedule`, request).pipe(
      map((response) => ({
        ...response,
        startTime: new Date(response.startTime),
        endTime: new Date(response.endTime),
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      })),
    );
  }

  getAvailableTimeSlots(staffId: string, date: Date): Observable<string[]> {
    const dateStr = date.toISOString().split('T')[0];
    return this.http.get<string[]>(`${this.apiUrl}/availability/${staffId}?date=${dateStr}`);
  }

  // Add other booking-related methods as needed
  // - cancelBooking
  // - confirmBooking
  // - getBookings (with pagination)
  // - etc.
}
