import { AppointmentStatus } from '@frontend-shared/shared/enums/appointment-status.enum';

export interface CreateAppointmentParams {
  serviceId: string;
  staffId: string;
  salonId: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  notes?: string;
  customerId?: string;
}

export interface UpdateAppointmentParams {
  id: string;
  serviceId?: string;
  staffId?: string;
  startTime?: string; // ISO date string
  endTime?: string; // ISO date string
  status?: AppointmentStatus;
  notes?: string;
}

export interface AppointmentQueryParams {
  customerId?: string;
  staffId?: string;
  salonId?: string;
  serviceId?: string;
  status?: AppointmentStatus | AppointmentStatus[];
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BookAppointmentParams {
  serviceId: string;
  staffId: string;
  salonId: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  customerNotes?: string;
  customerId?: string;
}

export interface RescheduleAppointmentParams {
  appointmentId: string;
  newStartTime: string; // ISO date string
  newEndTime: string; // ISO date string
  staffId?: string;
  notes?: string;
}

export interface CancelAppointmentParams {
  appointmentId: string;
  reason?: string;
  notifyCustomer?: boolean;
}

export interface AppointmentAvailabilityParams {
  serviceId: string;
  staffId?: string;
  salonId: string;
  date: string; // ISO date string
  duration?: number; // in minutes
}

export interface AppointmentConfirmationParams {
  appointmentId: string;
  sendEmail?: boolean;
  sendSms?: boolean;
  additionalNotes?: string;
}
