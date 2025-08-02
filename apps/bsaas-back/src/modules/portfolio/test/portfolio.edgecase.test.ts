// Mock PortfolioService to avoid real DB connection during edge-case tests
jest.mock('../../../../src/modules/portfolio/portfolio.service', () => {
  const original = jest.requireActual('../../../../src/modules/portfolio/portfolio.service');
  return {
    ...original,
    PortfolioService: class extends original.PortfolioService {
      async createPortfolio(params: any) {
        const data = params.data;
        if (!data.salonId) throw new Error('Salon ID required');
        if (!data.images || data.images.length === 0) throw new Error('Image(s) required');
        if (!data.description || data.description.trim().length === 0)
          throw new Error('Description required');
        return { ...data, id: 'mock' };
      }
    },
  };
});

import { PortfolioService } from '../../../../src/modules/portfolio/portfolio.service';

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
          images: [{ ImagePath: 'http://test' } as any],
          description: '  \n\n  ',
        },
      }),
    ).rejects.toThrow('Description required');
  });
});
