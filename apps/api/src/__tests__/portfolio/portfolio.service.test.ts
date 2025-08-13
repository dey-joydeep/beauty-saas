import { PortfolioService } from '../../modules/portfolio/portfolio.service';
import prisma from '../prismaTestClient';

describe('PortfolioService', () => {
  const service = new PortfolioService();

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

  it('should throw error when creating portfolio with empty description', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          salonId: 's1',
          userId: 'u1',
          images: [{ ImagePath: 'http://test' } as any],
          description: '',
        },
      }),
    ).rejects.toThrow('Description required');
  });

  it('should throw error when creating portfolio with whitespace description', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          salonId: 's1',
          userId: 'u1',
          images: [{ ImagePath: 'http://test' } as any],
          description: '   ',
        },
      }),
    ).rejects.toThrow('Description required');
  });

  it('should throw error when updating portfolio with empty description', async () => {
    await expect(service.updatePortfolio({ id: 'id', data: { description: '' } })).rejects.toThrow(
      'Description required',
    );
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
