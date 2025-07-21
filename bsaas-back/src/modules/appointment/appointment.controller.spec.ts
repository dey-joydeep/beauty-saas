import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import {
  AppointmentsFilterDto,
  AppointmentsOverviewDto,
  AppointmentStatus,
} from './dto/appointments-overview.dto';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

describe('AppointmentController', () => {
  let controller: AppointmentController;
  let service: AppointmentService;

  const mockAppService = {
    getAppointmentsOverview: jest.fn(),
  };

  const mockPrisma = {
    appointment: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentController],
      providers: [
        {
          provide: AppointmentService,
          useValue: mockAppService,
        },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    controller = module.get<AppointmentController>(AppointmentController);
    service = module.get<AppointmentService>(AppointmentService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAppointmentsOverview', () => {
    it('should return appointments overview with default filters', async () => {
      const mockResult: AppointmentsOverviewDto = {
        totalAppointments: 10,
        pendingAppointments: 3,
        confirmedAppointments: 5,
        completedAppointments: 0,
        cancelledAppointments: 2,
        noShowAppointments: 0,
        totalRevenue: 1000,
        averageDuration: 60,
        upcomingAppointments: [],
        recentAppointments: [],
        statusDistribution: {},
        dailyAppointments: {},
      };

      mockAppService.getAppointmentsOverview.mockResolvedValue(mockResult);

      const result = await controller.getAppointmentsOverview({});

      expect(service.getAppointmentsOverview).toHaveBeenCalledWith(
        expect.any(AppointmentsFilterDto),
      );
      expect(result).toEqual(mockResult);
    });

    it('should apply provided filters', async () => {
      const filters: Partial<AppointmentsFilterDto> = {
        status: AppointmentStatus.CONFIRMED,
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-12-31T23:59:59.999Z',
      };

      await controller.getAppointmentsOverview(filters);

      expect(service.getAppointmentsOverview).toHaveBeenCalledWith(
        expect.objectContaining({
          status: AppointmentStatus.CONFIRMED,
          startDate: '2023-01-01T00:00:00.000Z',
          endDate: '2023-12-31T23:59:59.999Z',
        }),
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Test error');
      mockAppService.getAppointmentsOverview.mockRejectedValue(error);

      await expect(controller.getAppointmentsOverview({})).rejects.toThrow(error);
    });
  });
});
