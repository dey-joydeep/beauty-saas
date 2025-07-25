export enum AppointmentStatus {
  PENDING = 'pending',
  BOOKED = 'booked',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NOSHOW = 'noshow',
}

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
  startTime: Date;
  endTime: Date;
  notes?: string;
}

export interface AppointmentResponse extends Appointment {}

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
