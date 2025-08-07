import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { createMock } from '@golevelup/ts-jest';
import { AppointmentService } from '../services/appointment.service';
import { AppointmentsFilterDto } from '../dto/requests/appointments-overview.dto';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let prisma: jest.Mocked<PrismaClient>;

  beforeEach(async () => {
    // Create a mock Prisma client
    prisma = createMock<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: PrismaClient,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAppointmentsOverview', () => {
    it('should return appointment overview data', async () => {
      // Arrange
      const mockFilters: AppointmentsFilterDto = {
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        tenantId: 'test-tenant-id',
      };

      // Mock Prisma methods
      prisma.appointment.count = jest.fn().mockResolvedValue(10);
      prisma.appointment.groupBy = jest.fn().mockResolvedValue([
        { status: 'COMPLETED', _count: 5 },
        { status: 'CANCELLED', _count: 2 },
      ]);
      prisma.appointment.aggregate = jest.fn().mockResolvedValue({
        _sum: { totalPrice: 1000 },
      });
      prisma.appointment.findMany = jest.fn().mockResolvedValue([]);

      // Act
      const result = await service.getAppointmentsOverview(mockFilters);

      // Assert
      expect(result).toBeDefined();
      expect(prisma.appointment.count).toHaveBeenCalled();
      expect(prisma.appointment.groupBy).toHaveBeenCalled();
      expect(prisma.appointment.aggregate).toHaveBeenCalled();
      expect(prisma.appointment.findMany).toHaveBeenCalledTimes(2); // For recent and upcoming appointments
    });
  });

  describe('getAppointmentsByUser', () => {
    it('should return appointments for a specific user', async () => {
      // Arrange
      const userId = 'test-user-id';
      const mockFilters: AppointmentsFilterDto = {
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };

      // Mock Prisma method
      prisma.appointment.findMany = jest.fn().mockResolvedValue([
        {
          id: 'appointment-1',
          customerId: 'test-user-id',
          // Add other required fields
        },
      ]);

      // Act
      const result = await service.getAppointmentsByUser(userId, mockFilters);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(prisma.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            customerId: userId,
          }),
        }),
      );
    });
  });

  describe('getAppointmentsBySalon', () => {
    it('should return appointments for a specific salon', async () => {
      // Arrange
      const salonId = 'test-salon-id';
      const mockFilters: AppointmentsFilterDto = {
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };

      // Mock Prisma method
      prisma.appointment.findMany = jest.fn().mockResolvedValue([
        {
          id: 'appointment-1',
          salonId: 'test-salon-id',
          // Add other required fields
        },
      ]);

      // Act
      const result = await service.getAppointmentsBySalon(salonId, mockFilters);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(prisma.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            salonId,
          }),
        }),
      );
    });
  });

  describe('checkUserEligibleToReview', () => {
    it('should return true if user is eligible to review a salon', async () => {
      // Arrange
      const userId = 'test-user-id';
      const salonId = 'test-salon-id';

      // Mock Prisma methods
      prisma.appointment.findFirst = jest.fn().mockResolvedValue({
        id: 'appointment-1',
        status: 'COMPLETED',
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      });

      prisma.review = {
        findFirst: jest.fn().mockResolvedValue(null),
      } as any;

      // Act
      const result = await service.checkUserEligibleToReview(userId, salonId);

      // Assert
      expect(result).toEqual({
        eligible: true,
      });
    });

    it('should return false if user has already reviewed the salon', async () => {
      // Arrange
      const userId = 'test-user-id';
      const salonId = 'test-salon-id';

      // Mock Prisma methods
      prisma.appointment.findFirst = jest.fn().mockResolvedValue({
        id: 'appointment-1',
        status: 'COMPLETED',
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      });

      prisma.review = {
        findFirst: jest.fn().mockResolvedValue({
          id: 'existing-review-id',
        }),
      } as any;

      // Act
      const result = await service.checkUserEligibleToReview(userId, salonId);

      // Assert
      expect(result).toEqual({
        eligible: false,
        message: 'You have already reviewed this salon',
      });
    });
  });
});
