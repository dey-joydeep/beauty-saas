// Placeholder for service integration tests (real DB)
import { PortfolioService } from '../../../services/portfolio.service';
import prisma from '../../prismaTestClient';

describe('PortfolioService Integration', () => {
  const service = new PortfolioService();

  beforeAll(() => {
    if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'changeme';
    if (!process.env.BASE_IMAGE_PATH)
      process.env.BASE_IMAGE_PATH = 'E:/data/bsaas/salon/${salonId}/';
    if (!process.env.PORTFOLIO_IMAGE_PATH)
      process.env.PORTFOLIO_IMAGE_PATH = 'portfolio/${portfolioId}/images';
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a portfolio in the DB', async () => {
    // Use real DB
    const created = await service.createPortfolio({
      data: {
        tenantId: 't1',
        salonId: 's1',
        userId: 'u1',
        description: 'desc',
        images: [{ imagePath: 'http://test' } as any],
      },
    });
    expect(created).toHaveProperty('id');
    expect(created.images && created.images.length).toBeGreaterThan(0);
    expect(created.images[0]).toHaveProperty('imagePath');
    // Clean up
    await prisma.portfolio.delete({ where: { id: created.id } });
  });

  it('should throw error for empty description (integration)', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          salonId: 's1',
          userId: 'u1',
          images: [{ imagePath: 'http://test' } as any],
          description: '',
        },
      }),
    ).rejects.toThrow('Description required');
  });

  it('should throw error for whitespace description (integration)', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          salonId: 's1',
          userId: 'u1',
          images: [{ imagePath: 'http://test' } as any],
          description: '   ',
        },
      }),
    ).rejects.toThrow('Description required');
  });

  it('should throw error for missing images', async () => {
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

  it('should throw error for missing salonId', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          userId: 'u1',
          images: [{ imagePath: 'http://test' } as any],
          description: 'desc',
        },
      }),
    ).rejects.toThrow('Salon ID required');
  });

  // ... (other service integration tests as in original, using real DB)
});
