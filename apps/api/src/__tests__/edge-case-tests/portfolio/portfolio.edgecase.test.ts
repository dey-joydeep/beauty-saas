import { PortfolioService } from '../../../services/portfolio.service';

describe('PortfolioService Edge Cases', () => {
  beforeAll(() => {
    if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'changeme';
    if (!process.env.BASE_IMAGE_PATH)
      process.env.BASE_IMAGE_PATH = 'E:/data/bsaas/salon/${salonId}/';
    if (!process.env.PORTFOLIO_IMAGE_PATH)
      process.env.PORTFOLIO_IMAGE_PATH = 'portfolio/${portfolioId}/images';
  });

  const service = new PortfolioService();
  it('should throw error for missing image data', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          salonId: 's1',
          userId: 'u1',
          description: 'desc',
          // images is missing
        },
      } as any),
    ).rejects.toThrow('Image(s) required');
  });
  it('should throw error for description with only whitespace and newlines', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          salonId: 's1',
          userId: 'u1',
          images: [
            {
              imagePath: 'someurl',
              id: 'img1',
              portfolioId: 'p1',
              createdAt: new Date().toISOString(),
            },
          ],
          description: '  \n\t ',
        },
      }),
    ).rejects.toThrow('Description required');
  });
  it('should throw error for missing salonId', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          userId: 'u1',
          images: [
            {
              imagePath: 'someurl',
              id: 'img1',
              portfolioId: 'p1',
              createdAt: new Date().toISOString(),
            },
          ],
          description: 'desc',
          // salonId is missing
        },
      } as any),
    ).rejects.toThrow('Salon ID required');
  });
  it('should throw error for missing description', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          salonId: 's1',
          userId: 'u1',
          images: [
            {
              imagePath: 'someurl',
              id: 'img1',
              portfolioId: 'p1',
              createdAt: new Date().toISOString(),
            },
          ],
          // description is missing
        },
      } as any),
    ).rejects.toThrow('Description required');
  });
  it('should throw error for missing image data', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          salonId: 's1',
          userId: 'u1',
          description: 'desc',
          images: [], // images is empty
        },
      } as any),
    ).rejects.toThrow('Image(s) required');
  });
  it('should throw error for description with only whitespace and newlines', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          salonId: 's1',
          userId: 'u1',
          images: [
            {
              imagePath: 'someurl',
              id: 'img1',
              portfolioId: 'p1',
              createdAt: new Date().toISOString(),
            },
          ],
          description: '  \n\t ',
        },
      }),
    ).rejects.toThrow('Description required');
  });
  it('should throw error for missing salonId', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          userId: 'u1',
          images: [
            {
              imagePath: 'someurl',
              id: 'img1',
              portfolioId: 'p1',
              createdAt: new Date().toISOString(),
            },
          ],
          description: 'desc',
          // salonId is missing
        },
      } as any),
    ).rejects.toThrow('Salon ID required');
  });
  it('should throw error for missing description', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          salonId: 's1',
          userId: 'u1',
          images: [
            {
              imagePath: 'someurl',
              id: 'img1',
              portfolioId: 'p1',
              createdAt: new Date().toISOString(),
            },
          ],
          // description is missing
        },
      } as any),
    ).rejects.toThrow('Description required');
  });
  it('should throw error for missing tenantId', async () => {
    await expect(
      service.createPortfolio({
        data: {
          salonId: 's1',
          userId: 'u1',
          images: [
            {
              imagePath: 'someurl',
              id: 'img1',
              portfolioId: 'p1',
              createdAt: new Date().toISOString(),
            },
          ],
          description: 'desc',
          // tenantId is missing
        },
      } as any),
    ).rejects.toThrow('Tenant ID required');
  });
  it('should throw error for missing userId', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          salonId: 's1',
          images: [
            {
              imagePath: 'someurl',
              id: 'img1',
              portfolioId: 'p1',
              createdAt: new Date().toISOString(),
            },
          ],
          description: 'desc',
          // userId is missing
        },
      } as any),
    ).rejects.toThrow('User ID required');
  });
  it('should throw error for missing image path', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          salonId: 's1',
          userId: 'u1',
          images: [{ id: 'img1', portfolioId: 'p1', createdAt: new Date().toISOString() }], // imagePath is missing
          description: 'desc',
        },
      } as any),
    ).rejects.toThrow('Image path required');
  });
  it('should throw error for invalid image path', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          salonId: 's1',
          userId: 'u1',
          images: [
            { imagePath: 123, id: 'img1', portfolioId: 'p1', createdAt: new Date().toISOString() },
          ], // imagePath is invalid
          description: 'desc',
        },
      } as any),
    ).rejects.toThrow('Image path must be a string');
  });
  it('should throw error for invalid tenantId', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 123, // tenantId is invalid
          salonId: 's1',
          userId: 'u1',
          images: [
            {
              imagePath: 'someurl',
              id: 'img1',
              portfolioId: 'p1',
              createdAt: new Date().toISOString(),
            },
          ],
          description: 'desc',
        },
      } as any),
    ).rejects.toThrow('Tenant ID must be a string');
  });
  it('should throw error for invalid salonId', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          salonId: 123, // salonId is invalid
          userId: 'u1',
          images: [
            {
              imagePath: 'someurl',
              id: 'img1',
              portfolioId: 'p1',
              createdAt: new Date().toISOString(),
            },
          ],
          description: 'desc',
        },
      } as any),
    ).rejects.toThrow('Salon ID must be a string');
  });
  it('should throw error for invalid userId', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          salonId: 's1',
          userId: 123, // userId is invalid
          images: [
            {
              imagePath: 'someurl',
              id: 'img1',
              portfolioId: 'p1',
              createdAt: new Date().toISOString(),
            },
          ],
          description: 'desc',
        },
      } as any),
    ).rejects.toThrow('User ID must be a string');
  });
  it('should throw error for invalid description', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          salonId: 's1',
          userId: 'u1',
          images: [
            {
              imagePath: 'someurl',
              id: 'img1',
              portfolioId: 'p1',
              createdAt: new Date().toISOString(),
            },
          ],
          description: 123, // description is invalid
        },
      } as any),
    ).rejects.toThrow('Description must be a string');
  });
  it('should throw error for invalid images', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          salonId: 's1',
          userId: 'u1',
          images: 'someurl', // images is invalid
          description: 'desc',
        },
      } as any),
    ).rejects.toThrow('Images must be an array');
  });
  it('should throw error for invalid image', async () => {
    await expect(
      service.createPortfolio({
        data: {
          tenantId: 't1',
          salonId: 's1',
          userId: 'u1',
          images: ['someurl'], // image is invalid
          description: 'desc',
        },
      } as any),
    ).rejects.toThrow('Image must be an object');
  });
});
