// Use require instead of import for PrismaClient to avoid TS error with @prisma/client in modular refactor
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Inline BookingStatus enum to avoid import issues and match project-wide convention
enum BookingStatus {
  booked = 'booked',
  completed = 'completed',
  cancelled = 'cancelled',
  noShow = 'noShow',
}

// Inline Booking type to avoid namespace/type import issues
export type Booking = {
  id: string;
  salonId: string;
  userId: string;
  staffId: string | null;
  serviceId: string;
  date: string;
  time: string;
  status: BookingStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function mapBooking(prismaBooking: any): Booking {
  return {
    id: prismaBooking.id,
    salonId: prismaBooking.salonId,
    userId: prismaBooking.userId,
    staffId: prismaBooking.staffId,
    serviceId: prismaBooking.serviceId,
    date: prismaBooking.date,
    time: prismaBooking.time,
    status: prismaBooking.status,
    notes: prismaBooking.notes,
    createdAt: prismaBooking.createdAt,
    updatedAt: prismaBooking.updatedAt,
  };
}

export { BookingStatus };

export type GetBookingByIdParams = {
  id: string;
};

export class BookingService {
  async getBookings(params: { filter: Record<string, any> }): Promise<Booking[]> {
    // Convert filter keys to camelCase for Prisma model
    const filter = Object.fromEntries(
      Object.entries(params.filter).map(([key, value]) => [
        key.replace(/_(.)/g, (_, c) => c.toUpperCase()),
        value,
      ]),
    );
    const bookings = await prisma.booking.findMany({ where: filter });
    return bookings.map(mapBooking);
  }

  async getBookingById(params: GetBookingByIdParams): Promise<Booking | null> {
    const booking = await prisma.booking.findUnique({ where: { id: params.id } });
    return booking ? mapBooking(booking) : null;
  }

  async createBooking(params: {
    data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Booking> {
    // Only use camelCase for fields
    const booking = await prisma.booking.create({
      data: {
        salonId: params.data.salonId,
        userId: params.data.userId,
        staffId: params.data.staffId,
        serviceId: params.data.serviceId,
        date: params.data.date,
        time: params.data.time,
        status: params.data.status,
        notes: params.data.notes,
      },
    });
    return mapBooking(booking);
  }

  async updateBooking(params: {
    id: string;
    data: Partial<Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>>;
  }): Promise<Booking | null> {
    const updateData: any = {};
    if (params.data.salonId !== undefined) updateData.salonId = params.data.salonId;
    if (params.data.userId !== undefined) updateData.userId = params.data.userId;
    if (params.data.staffId !== undefined) updateData.staffId = params.data.staffId;
    if (params.data.serviceId !== undefined) updateData.serviceId = params.data.serviceId;
    if (params.data.date !== undefined) updateData.date = params.data.date;
    if (params.data.time !== undefined) updateData.time = params.data.time;
    if (params.data.status !== undefined) updateData.status = params.data.status;
    if (params.data.notes !== undefined) updateData.notes = params.data.notes;
    const booking = await prisma.booking.update({ where: { id: params.id }, data: updateData });
    return booking ? mapBooking(booking) : null;
  }

  async deleteBooking(params: { id: string }): Promise<boolean> {
    await prisma.booking.delete({ where: { id: params.id } });
    return true;
  }

  async isUserEligibleToReview(userId: string, salonId: string): Promise<boolean> {
    const completed = await prisma.booking.findFirst({
      where: {
        userId,
        salonId,
        status: BookingStatus.completed,
      },
    });
    return !!completed;
  }

  async getAverageRatingForSalon(salonId: string): Promise<number> {
    // Use snake_case for DB query (Prisma expects DB field mapping, not camelCase)
    const reviews = await prisma.review.findMany({ where: { salon_id: salonId } });
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
    return sum / reviews.length;
  }
}
