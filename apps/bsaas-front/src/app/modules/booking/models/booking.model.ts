export enum AppointmentStatus {
  PENDING = 'pending',
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
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
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
  available: boolean;
  slotStart: Date;
  slotEnd: Date;
}
