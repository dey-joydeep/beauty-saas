import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import {
  Appointment,
  AppointmentListResponse,
  AppointmentRequest,
  AppointmentResponse,
  AppointmentWithDetails,
  TimeSlot,
} from '../models/appointment.model';
import { AppointmentStatus } from '@beauty-saas/shared/enums/appointment-status.enum';

export interface RescheduleRequest {
  startTime: Date;
  endTime: Date;
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  /**
   * Get a single appointment by ID
   * @param id The appointment ID
   */
  getAppointment(id: string): Observable<AppointmentWithDetails> {
    return this.http.get<AppointmentWithDetails>(`${this.apiUrl}/${id}`).pipe(
      map((response) => ({
        ...response,
        // Ensure date fields are properly formatted
        appointmentDate: response.appointmentDate,
        startTime: response.startTime,
        endTime: response.endTime,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      })),
    );
  }

  /**
   * Get a list of appointments with optional filtering
   * @param params Optional query parameters for filtering
   */
  getAppointments(params?: {
    customerId?: string;
    staffId?: string;
    serviceId?: string;
    status?: AppointmentStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Observable<{ data: Appointment[]; total: number }> {
    // Convert Date objects to ISO strings for the API
    const queryParams: any = { ...params };

    if (params?.startDate) {
      queryParams.startDate = params.startDate.toISOString();
      delete queryParams.startDateObj;
    }

    if (params?.endDate) {
      queryParams.endDate = params.endDate.toISOString();
      delete queryParams.endDateObj;
    }

    return this.http.get<AppointmentListResponse>(this.apiUrl, { params: queryParams }).pipe(
      map((response) => ({
        data: response.data.map((appt) => this.mapToAppointment(appt)),
        total: response.total,
      })),
    );
  }

  /**
   * Create a new appointment
   * @param appointment The appointment data to create
   */
  createAppointment(appointment: AppointmentRequest): Observable<Appointment> {
    return this.http.post<AppointmentResponse>(this.apiUrl, appointment).pipe(map(this.mapToAppointment));
  }

  /**
   * Update an existing appointment
   * @param id The appointment ID
   * @param updates The fields to update
   */
  updateAppointment(id: string, updates: Partial<AppointmentRequest>): Observable<Appointment> {
    return this.http.patch<AppointmentResponse>(`${this.apiUrl}/${id}`, updates).pipe(map(this.mapToAppointment));
  }

  /**
   * Cancel an appointment
   * @param id The appointment ID
   * @param reason Optional cancellation reason
   */
  cancelAppointment(id: string, reason: string): Observable<Appointment> {
    return this.http.patch<AppointmentResponse>(`${this.apiUrl}/${id}/cancel`, { reason }).pipe(map(this.mapToAppointment));
  }

  /**
   * Get available time slots for scheduling an appointment
   * @param params Parameters for finding available time slots
   */
  getAvailableTimeSlots(params: { serviceId: string; staffId?: string; date: string; duration: number }): Observable<TimeSlot[]> {
    return this.http
      .get<{ data: TimeSlot[] }>(`${this.apiUrl}/available-slots`, { params: { ...params, duration: params.duration.toString() } })
      .pipe(map((response) => response.data || []));
  }

  /**
   * Reschedule an appointment
   * @param id The appointment ID
   * @param startTime The new start time
   * @param endTime The new end time
   * @param notes Optional notes about the reschedule
   */
  rescheduleAppointment(id: string, startTime: Date, endTime: Date, notes?: string): Observable<Appointment> {
    const request: RescheduleRequest = { startTime, endTime };
    if (notes) {
      request.notes = notes;
    }

    return this.http.patch<AppointmentResponse>(`${this.apiUrl}/${id}/reschedule`, request).pipe(map(this.mapToAppointment));
  }

  /**
   * Delete an appointment
   * @param id The appointment ID
   */
  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Helper method to map API response to Appointment model
   */
  private mapToAppointment(response: AppointmentResponse): Appointment {
    const toIsoString = (date: Date | string | undefined): string => {
      if (!date) return new Date().toISOString();
      return typeof date === 'string' ? date : date.toISOString();
    };

    return {
      ...response,
      appointmentDate: toIsoString(response.appointmentDate as any),
      startTime: toIsoString(response.startTime as any),
      endTime: toIsoString(response.endTime as any),
      createdAt: toIsoString(response.createdAt as any),
      updatedAt: toIsoString(response.updatedAt as any),
    };
  }
}

