import { BookingService, BookingStatus } from '../../modules/booking/booking.service';

describe('BookingService Unit', () => {
  let service: BookingService;
  beforeEach(() => {
    service = new BookingService();
  });

  it('should create a new booking', async () => {
    const booking = await service.createBooking({
      data: {
        userId: 'user1',
        salonId: 'salon1',
        serviceId: 'Haircut',
        date: new Date().toISOString(),
        time: '10:00',
        status: BookingStatus.booked,
        staffId: null,
        notes: null,
      },
    });
    expect(booking).toHaveProperty('id');
    expect(booking.userId).toBe('user1');
    expect(booking.salonId).toBe('salon1');
    expect(booking.status).toBe(BookingStatus.booked);
  });

  it('should return bookings for a user', async () => {
    await service.createBooking({
      data: {
        userId: 'user2',
        salonId: 'salon2',
        serviceId: 'Coloring',
        date: new Date().toISOString(),
        time: '11:00',
        status: BookingStatus.booked,
        staffId: null,
        notes: null,
      },
    });
    const bookings = await service.getBookings({ filter: { userId: 'user2' } });
    expect(Array.isArray(bookings)).toBe(true);
    expect(bookings.length).toBeGreaterThan(0);
    expect(bookings[0].userId).toBe('user2');
  });

  it('should check user eligibility to review', async () => {
    await service.createBooking({
      data: {
        userId: 'user3',
        salonId: 'salon3',
        serviceId: 'Manicure',
        date: new Date().toISOString(),
        time: '12:00',
        status: BookingStatus.booked,
        staffId: null,
        notes: null,
      },
    });
    // Simulate a completed booking
    const bookings = await service.getBookings({ filter: { userId: 'user3' } });
    bookings[0].status = BookingStatus.completed;
    expect(await service.isUserEligibleToReview('user3', 'salon3')).toBe(true);
  });
});
