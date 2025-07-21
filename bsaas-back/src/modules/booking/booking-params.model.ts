// BookingParams for BookingService and controller

export interface GetBookingsParams {
  filter: Record<string, any>;
}

export interface CreateBookingParams {
  data: {
    salonId: string;
    userId: string;
    staffId?: string | null;
    serviceId: string;
    date: string; // ISO date string
    time: string; // e.g. '10:00'
    status: string;
    notes?: string | null;
  };
}

export interface UpdateBookingParams {
  id: string;
  data: Partial<Omit<CreateBookingParams['data'], 'id'>>;
}

export interface DeleteBookingParams {
  id: string;
}

export interface GetBookingByIdParams {
  id: string;
}
