import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { Appointment, AppointmentRequest, AppointmentResponse, AppointmentListResponse } from '../models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  getAppointment(id: string): Observable<Appointment> {
    return this.http.get<AppointmentResponse>(`${this.apiUrl}/${id}`).pipe(
      map((response) => ({
        ...response,
        // Keep dates as strings to match the Appointment interface
        startTime: response.startTime,
        endTime: response.endTime,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      })),
    );
  }

  rescheduleAppointment(id: string, date: Date, time: string, notes?: string): Observable<Appointment> {
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1); // Assuming 1 hour duration for now

    const request: AppointmentRequest = {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      notes,
    };

    return this.http.patch<AppointmentResponse>(`${this.apiUrl}/${id}/reschedule`, request).pipe(
      map((response) => ({
        ...response,
        // Keep dates as strings to match the Appointment interface
        startTime: response.startTime,
        endTime: response.endTime,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      })),
    );
  }

  cancelAppointment(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/cancel`, {});
  }

  getAvailableTimeSlots(staffId: string, date: Date): Observable<string[]> {
    const dateStr = date.toISOString().split('T')[0];
    return this.http.get<string[]>(`${this.apiUrl}/availability/${staffId}?date=${dateStr}`);
  }

  // Add other appointment-related methods as needed
  // - cancelAppointment
  // - confirmAppointment
  // - getAppointments (with pagination)
  // - etc.
}
