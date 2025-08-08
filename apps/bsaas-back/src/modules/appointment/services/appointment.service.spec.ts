import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { AppointmentService } from './appointment.service';
import { AppointmentsFilterDto } from '../dto/appointment-filter.dto';
import { AppointmentStatus } from '@shared/enums/appointment-status.enum';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let prisma: jest.Mocked<PrismaClient>;

  beforeEach(async () => {
    // Create a mock Prisma client
    prisma = {
      appointment: {
        count: jest.fn(),
        groupBy: jest.fn(),
        aggregate: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      review: {
        findFirst: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaClient>;

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
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-12-31T23:59:59.999Z',
        limit: 10,
        offset: 0,
        toPrismaFilter: jest.fn().mockReturnValue({}) as any,
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
      const result = await service.getAppointmentsOverview(mockFilters, 'test-user-id');

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
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-12-31T23:59:59.999Z',
        limit: 10,
        offset: 0,
        toPrismaFilter: jest.fn().mockReturnValue({}) as any,
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

  describe('getTenantAppointments', () => {
    it('should return appointments for a specific tenant', async () => {
      // Arrange
      const tenantId = 'test-tenant-id';
      const mockFilters: AppointmentsFilterDto = {
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-12-31T23:59:59.999Z',
        limit: 10,
        offset: 0,
        toPrismaFilter: jest.fn().mockReturnValue({}) as any,
      };

      // Mock Prisma method
      prisma.appointment.findMany = jest.fn().mockResolvedValue([
        {
          id: 'appointment-1',
          tenantId: 'test-tenant-id',
          startTime: new Date('2023-01-01T10:00:00.000Z'),
          endTime: new Date('2023-01-01T11:00:00.000Z'),
          status: AppointmentStatus.CONFIRMED,
          customer: { id: 'customer-1', name: 'Test Customer' },
          services: [
            {
              tenantService: { id: 'service-1', name: 'Test Service' },
              staff: { id: 'staff-1', user: { name: 'Test Staff' } },
            },
          ],
        },
      ]);

      // Act
      const result = await service.getTenantAppointments(tenantId, mockFilters);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(prisma.appointment.findMany).toHaveBeenCalled();
    });
  });

  describe('checkUserEligibleToReview', () => {
    it('should return true if user is eligible to review a service', async () => {
      // Arrange
      const userId = 'test-user-id';
      const serviceId = 'test-service-id';
      const type = 'service';

      // Mock Prisma methods
      prisma.appointment.findFirst = jest.fn().mockResolvedValue({
        id: 'appointment-1',
        status: AppointmentStatus.COMPLETED,
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        services: [{
          tenantServiceId: serviceId,
        }],
      });

      prisma.review.findFirst = jest.fn().mockResolvedValue(null);

      // Act
      const result = await service.checkUserEligibleToReview(userId, serviceId, type);

      // Assert
      expect(result).toEqual({
        eligible: true,
      });
    });

    it('should return false if user has already reviewed the service', async () => {
      // Arrange
      const userId = 'test-user-id';
      const serviceId = 'test-service-id';
      const type = 'service';

      // Mock Prisma methods
      prisma.appointment.findFirst = jest.fn().mockResolvedValue({
        id: 'appointment-1',
        status: AppointmentStatus.COMPLETED,
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        services: [{
          tenantServiceId: serviceId,
        }],
      });

      prisma.review.findFirst = jest.fn().mockResolvedValue({
        id: 'existing-review-id',
      });

      // Act
      const result = await service.checkUserEligibleToReview(userId, serviceId, type);

      // Assert
      expect(result).toEqual({
        eligible: false,
        message: 'You have already reviewed this service',
      });
    });
  });
});
