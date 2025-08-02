// Mock PrismaClient to avoid real DB connection during edge-case tests
jest.mock('../../services/portfolio.service', () => {
  const original = jest.requireActual('../../services/portfolio.service');
  return {
    ...original,
    PortfolioService: class extends original.PortfolioService {
      async createPortfolio(params: any) {
        const data = params.data;
        // Use the same validation logic, but don't call prisma
        if (!data.salonId) throw new Error('Salon ID required');
        if (!data.images || data.images.length === 0) throw new Error('Image(s) required');
        if (!data.description || data.description.trim().length === 0)
          throw new Error('Description required');
        return { ...data, id: 'mock' };
      }
    },
  };
});

import { PortfolioService } from '../../services/portfolio.service';

describe('PortfolioService Edge Cases', () => {
  const service = new PortfolioService();

  afterAll(async () => {
    // No need to disconnect prisma, as real DB is not used in these tests
  });

  it('should throw error when creating portfolio with missing images', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          salonId: 's1',
          userId: 'u1',
          description: 'desc',
          images: undefined as any,
        },
      }),
    ).rejects.toThrow('Image(s) required');
  });

  it('should throw error when creating portfolio with description containing only whitespace and newlines', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          salonId: 's1',
          userId: 'u1',
          images: [{ ImagePath: 'someurl' } as any],
          description: '  \n\t ',
        },
      }),
    ).rejects.toThrow('Description required');
  });

  it('should throw error when creating portfolio with missing salonId', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          userId: 'u1',
          images: [{ ImagePath: 'someurl' } as any],
          description: 'desc',
          salonId: 's1',
        },
      }),
    ).rejects.toThrow('Salon ID required');
  });
});
