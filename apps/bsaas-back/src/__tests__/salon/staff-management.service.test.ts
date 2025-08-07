import { Test, TestingModule } from '@nestjs/testing';
import { SalonService } from '../../modules/salon/salon.service';
import { PrismaService } from '../../prisma/prisma.service';

// Mock PrismaService
const mockPrismaService = {
  staff: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('SalonService Staff Management', () => {
  let service: SalonService;
  const salonId = 'salon1';
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalonService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SalonService>(SalonService);
    
    // Clear all mocks between tests
    jest.clearAllMocks();
  });

  describe('getStaff', () => {
    it('should return an array of staff members', async () => {
      const mockStaff = [
        { id: '1', name: 'Staff 1', salonId },
        { id: '2', name: 'Staff 2', salonId },
      ];
      
      mockPrismaService.staff.findMany.mockResolvedValue(mockStaff);
      
      const result = await service.getStaff({ salonId });
      
      expect(result).toEqual(mockStaff);
      expect(mockPrismaService.staff.findMany).toHaveBeenCalledWith({
        where: { salonId },
      });
    });
  });

  describe('addStaff', () => {
    it('should add a new staff member', async () => {
      const newStaff = {
        userId: 'user-dave',
        name: 'Dave',
        email: 'dave@example.com',
        position: 'stylist',
        isActive: true,
      };
      const added = await service.addStaff({ salonId, staff: newStaff });
      expect(added.name).toBe('Dave');
      const staffList = await service.getStaff({ salonId });
      expect(staffList.find((s) => s.id === added.id)).toBeTruthy();
    });
  });

  describe('removeStaff', () => {
    it('should remove staff', async () => {
      const staffList = await service.getStaff({ salonId });
      if (staffList.length === 0) return;
      const staffId = staffList[0].id;
      const ok = await service.removeStaff({ salonId, staffId });
      expect(ok).toBe(true);
      const after = await service.getStaff({ salonId });
      expect(after.find((s) => s.id === staffId)).toBeFalsy();
    });
  });
});
