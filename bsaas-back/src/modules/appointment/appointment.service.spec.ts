import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma/prisma.service';
import { AppointmentService } from './appointment.service';
import { AppointmentsFilterDto, AppointmentStatus } from './dto/appointments-overview.dto';
import { addDays, format, subDays } from 'date-fns';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let prisma: PrismaService;

  const mockPrismaService = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $on: jest.fn(),
    appointment: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    customer: {
      findUnique: jest.fn(),
    },
    staff: {
      findUnique: jest.fn(),
    },
    service: {
      findUnique: jest.fn(),
    },
    salon: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAppointmentsOverview', () => {
    const now = new Date();
    const mockAppointments = [
      {
        id: '1',
        title: 'Haircut',
        description: 'Regular haircut',
        startTime: addDays(now, 1), // Future appointment
        endTime: addDays(now, 1.5),
        status: 'CONFIRMED',
        customer: { id: 'cust1', name: 'John Doe', email: 'john@example.com' },
        staff: { id: 'staff1', name: 'Jane Smith' },
        service: { id: 'svc1', name: 'Haircut', duration: 30, price: 30 },
        salon: { id: 'salon1', name: 'Beauty Salon' },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '2',
        title: 'Manicure',
        description: 'French manicure',
        startTime: subDays(now, 1), // Past appointment
        endTime: subDays(now, 0.9),
        status: 'COMPLETED',
        customer: { id: 'cust2', name: 'Alice Johnson', email: 'alice@example.com' },
        staff: { id: 'staff2', name: 'Bob Brown' },
        service: { id: 'svc2', name: 'Manicure', duration: 60, price: 25 },
        salon: { id: 'salon1', name: 'Beauty Salon' },
        createdAt: subDays(now, 2),
        updatedAt: subDays(now, 1),
      },
    ];

    beforeEach(() => {
      mockPrismaService.appointment.findMany.mockResolvedValue(mockAppointments);
    });

    it('should return appointments overview with correct statistics', async () => {
      const filters: AppointmentsFilterDto = {};
      const result = await service.getAppointmentsOverview(filters);

      expect(result).toBeDefined();
      expect(result.totalAppointments).toBe(2);
      expect(result.confirmedAppointments).toBe(1);
      expect(result.completedAppointments).toBe(1);
      expect(result.upcomingAppointments.length).toBe(1);
      expect(result.recentAppointments.length).toBe(1);
      expect(result.totalRevenue).toBe(25); // Only completed appointment's price
      expect(result.averageDuration).toBe(60); // Only completed appointment's duration
    });

    it('should apply date filters correctly', async () => {
      const startDate = subDays(now, 2).toISOString();
      const endDate = now.toISOString();
      const filters: AppointmentsFilterDto = { startDate, endDate };

      await service.getAppointmentsOverview(filters);

      expect(mockPrismaService.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              { startTime: { gte: new Date(startDate) } },
              { startTime: { lte: new Date(endDate) } },
            ],
          },
        }),
      );
    });

    it('should apply status filter correctly', async () => {
      const filters: AppointmentsFilterDto = { status: AppointmentStatus.CONFIRMED };

      await service.getAppointmentsOverview(filters);

      expect(mockPrismaService.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: AppointmentStatus.CONFIRMED },
        }),
      );
    });

    it('should return empty overview when no appointments found', async () => {
      mockPrismaService.appointment.findMany.mockResolvedValueOnce([]);

      const result = await service.getAppointmentsOverview({});

      expect(result.totalAppointments).toBe(0);
      expect(result.upcomingAppointments).toHaveLength(0);
      expect(result.recentAppointments).toHaveLength(0);
      expect(result.totalRevenue).toBe(0);
    });
  });

  describe('countByStatus', () => {
    it('should count appointments by status correctly', () => {
      const appointments = [
        { status: 'CONFIRMED' },
        { status: 'CONFIRMED' },
        { status: 'COMPLETED' },
        { status: 'CANCELLED' },
        { status: 'PENDING' },
      ];

      // @ts-ignore - Accessing private method for testing
      const result = service.countByStatus(appointments);

      expect(result).toEqual({
        CONFIRMED: 2,
        COMPLETED: 1,
        CANCELLED: 1,
        PENDING: 1,
      });
    });
  });

  describe('countDailyAppointments', () => {
    it('should count appointments by day correctly', () => {
      const now = new Date();
      const thirtyDaysAgo = subDays(now, 30);

      const appointments = [{ startTime: now }, { startTime: now }, { startTime: subDays(now, 1) }];

      // @ts-ignore - Accessing private method for testing
      const result = service.countDailyAppointments(appointments, thirtyDaysAgo, now);

      const todayKey = format(now, 'yyyy-MM-dd');
      const yesterdayKey = format(subDays(now, 1), 'yyyy-MM-dd');

      expect(result[todayKey]).toBe(2);
      expect(result[yesterdayKey]).toBe(1);
    });
  });
});
