export interface CreateBookingParams {
  userId: string;
  salonId: string;
  services: string[];
  staffId: string;
  date: string;
  note?: string;
}
