import { AppointmentStatus } from '@frontend-shared/shared/enums/appointment-status.enum';

export interface Appointment {
  id: string;
  customerId: string;
  serviceId: string;
  staffId: string;
  salonId: string;
  // Can be either a Date object or ISO date string
  appointmentDate: Date | string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  // Can be either a Date object or ISO date string
  createdAt: Date | string;
  // Can be either a Date object or ISO date string
  updatedAt: Date | string;
}

export interface AppointmentRequest {
  serviceId?: string;
  staffId?: string;
  salonId?: string;
  startTime: Date | string;
  endTime: Date | string;
  notes?: string;
}

export interface AppointmentResponse extends Appointment {}

export interface AppointmentWithDetails extends Appointment {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  staffName: string;
  salonName: string;
  paymentStatus?: string;
  amountPaid?: number;
  totalAmount?: number;
  createdBy?: string;
  metadata?: Record<string, any>;
}

export interface AppointmentListResponse {
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
}

export interface TimeSlot {
  time: string;
  display: string;
  available: boolean;
  slotStart: Date | string;
  slotEnd: Date | string;
  startTime?: string;
  endTime?: string;
}
