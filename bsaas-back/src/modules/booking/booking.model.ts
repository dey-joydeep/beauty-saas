// Booking model for booking module

export interface Booking {
  id: string;
  salonId: string;
  userId: string;
  staffId: string | null;
  serviceId: string;
  date: string; // ISO date string
  time: string; // e.g. '10:00'
  status: string;
  notes: string | null;
}
