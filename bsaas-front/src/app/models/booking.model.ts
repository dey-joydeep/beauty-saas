export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NOSHOW = 'noshow',
}

export interface Booking {
  id: string;
  customerId: string;
  serviceId: string;
  staffId: string;
  salonId: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingRequest {
  serviceId: string;
  staffId: string;
  salonId: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
}

export interface BookingResponse extends Booking {}

export interface BookingListResponse {
  data: Booking[];
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
