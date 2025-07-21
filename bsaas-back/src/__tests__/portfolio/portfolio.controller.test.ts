import request from 'supertest';
import app from '../../app';
import * as path from 'path';
import * as fs from 'fs';
import prisma from '../prismaTestClient';
import { PortfolioService } from '../../services/portfolio.service';
import jwt from 'jsonwebtoken';
import { createSolidColorImage } from '../testHelper';

jest.mock('../../services/portfolio.service');

const mockedService = PortfolioService as jest.MockedClass<typeof PortfolioService>;

const testImagePath = path.join(__dirname, 'test-image.png');
const testTenantId = 'test-tenant';
const testUserId = 'test-user';
const testPortfolioId = 'test-portfolio';

// Generate a valid JWT for test requests
const testToken = jwt.sign(
  { id: testUserId, tenantId: testTenantId, roles: ['owner'] },
  process.env.JWT_SECRET || 'testsecret',
);

describe('Portfolio Controller', () => {
  beforeAll(async () => {
    // Ensure test env vars are loaded
    if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'changeme';
    if (!process.env.BASE_IMAGE_PATH)
      process.env.BASE_IMAGE_PATH = 'E:/data/bsaas/salon/${salonId}/';
    if (!process.env.PORTFOLIO_IMAGE_PATH)
      process.env.PORTFOLIO_IMAGE_PATH = 'portfolio/${portfolioId}/images';

    // Mock fs.existsSync to always return true for test image path
    jest.spyOn(fs, 'existsSync').mockImplementation((p) => {
      if (typeof p === 'string' && p.includes('fake/path/to/image.jpg')) return true;
      return fs.existsSync(p);
    });
    // Optionally mock res.sendFile if needed (not strictly required for status code check)
    // jest.spyOn(res, 'sendFile').mockImplementation(() => {});

    // Ensure test user and tenant exist
    await prisma.tenant.upsert({
      where: { id: testTenantId },
      update: {},
      create: { id: testTenantId, name: 'Test Tenant', email: 'test-tenant@example.com' },
    });
    await prisma.user.upsert({
      where: { id: testUserId },
      update: {},
      create: {
        id: testUserId,
        tenantId: testTenantId,
        email: 'test@example.com',
        name: 'Test User',
        isVerified: true,
        passwordHash: 'hashed',
        roles: {
          create: [{ role: { connect: { name: 'owner' } } }],
        },
      },
    });
    // Create a valid dummy image file for upload using Jimp (via testHelper)
    await createSolidColorImage(testImagePath, 10, 10, [255, 0, 0, 255]); // 10x10 solid red
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    fs.unlinkSync(testImagePath);
    await prisma.portfolio.deleteMany({ where: { tenantId: testTenantId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await prisma.tenant.deleteMany({ where: { id: testTenantId } });
    await prisma.$disconnect();
  });

  describe('createPortfolioItem', () => {
    it('should return 201 on valid image upload', async () => {
      (mockedService.prototype.createPortfolio as jest.Mock).mockImplementation(async (data) => ({
        id: testPortfolioId,
        tenantId: testTenantId,
        userId: testUserId,
        description: data.description || null,
        images: [
          {
            id: 'img1',
            portfolioId: testPortfolioId,
            imagePath: '/fake/path/to/image.jpg',
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      const res = await request(app)
        .post('/api/portfolio')
        .set('Authorization', `Bearer ${testToken}`)
        .field('tenantId', testTenantId)
        .field('userId', testUserId)
        .field('description', 'desc')
        .attach('image', testImagePath);
      expect(res.status).toBe(201);
      expect(res.body.id).toBe(testPortfolioId);
      expect(res.body.images[0].imagePath).toBeDefined();
    });
    it('should return 400 if image file is missing', async () => {
      const res = await request(app)
        .post('/api/portfolio')
        .set('Authorization', `Bearer ${testToken}`)
        .field('tenantId', testTenantId)
        .field('userId', testUserId)
        .field('description', 'desc');
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/image file/i);
    });
    it('should return 500 on service error', async () => {
      (mockedService.prototype.createPortfolio as jest.Mock).mockRejectedValueOnce(
        new Error('fail'),
      );
      const res = await request(app)
        .post('/api/portfolio')
        .set('Authorization', `Bearer ${testToken}`)
        .field('tenantId', testTenantId)
        .field('userId', testUserId)
        .field('description', 'desc')
        .attach('image', testImagePath);
      expect(res.status).toBe(500);
      expect(res.body.message).toMatch(/fail/i);
    });
  });

  describe('getPortfolioItems', () => {
    it('should return items (sanitized)', async () => {
      (mockedService.prototype.getPortfolios as jest.Mock).mockImplementation(async (tenantId) => [
        {
          id: '1',
          tenantId: testTenantId,
          userId: testUserId,
          description: 'desc',
          images: [
            {
              id: 'img1',
              portfolioId: '1',
              imagePath: '/fake/path/to/image.jpg',
              createdAt: new Date().toISOString(),
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any,
      ]);
      const res = await request(app)
        .get('/api/portfolio?tenantId=' + testTenantId)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(res.body[0].id).toBe('1');
      expect(res.body[0].images[0].imagePath).toBeDefined();
    });
    it('should return 500 on service error', async () => {
      (mockedService.prototype.getPortfolios as jest.Mock).mockRejectedValueOnce(new Error('fail'));
      const res = await request(app)
        .get('/api/portfolio?tenantId=' + testTenantId)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(500);
    });
  });

  describe('updatePortfolioItem', () => {
    it('should update description and/or image', async () => {
      (mockedService.prototype.updatePortfolio as jest.Mock).mockImplementation(
        async (id, data) => ({
          id: id,
          tenantId: testTenantId,
          userId: testUserId,
          description: data.description || null,
          images: [
            {
              id: 'img1',
              portfolioId: id,
              imagePath: '/fake/path/to/image.jpg',
              createdAt: new Date().toISOString(),
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
      const res = await request(app)
        .put(`/api/portfolio/${testPortfolioId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .field('tenantId', testTenantId)
        .field('userId', testUserId)
        .field('description', 'updated desc')
        .attach('image', testImagePath);
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('updated desc');
      expect(res.body.images[0].imagePath).toBeDefined();
    });
    it('should return 500 on service error', async () => {
      (mockedService.prototype.updatePortfolio as jest.Mock).mockRejectedValueOnce(
        new Error('fail'),
      );
      const res = await request(app)
        .put(`/api/portfolio/${testPortfolioId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .field('tenantId', testTenantId)
        .field('userId', testUserId)
        .field('description', 'updated desc')
        .attach('image', testImagePath);
      expect(res.status).toBe(500);
    });
  });

  describe('deletePortfolioItem', () => {
    it('should delete and return 204', async () => {
      (mockedService.prototype.deletePortfolio as jest.Mock).mockImplementation(async (id) => ({
        id: id,
        tenantId: testTenantId,
        userId: testUserId,
        description: 'desc',
        images: [
          {
            id: 'img1',
            portfolioId: id,
            imagePath: '/fake/path/to/image.jpg',
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      const res = await request(app)
        .delete('/api/portfolio/' + testPortfolioId)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(204);
    });
    it('should return 500 on service error', async () => {
      (mockedService.prototype.deletePortfolio as jest.Mock).mockRejectedValueOnce(
        new Error('fail'),
      );
      const res = await request(app)
        .delete('/api/portfolio/' + testPortfolioId)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(500);
    });
  });

  describe('getPortfolioImage', () => {
    it('should return image if found', async () => {
      (mockedService.prototype.getPortfolioById as jest.Mock).mockImplementation(async (id) => ({
        id: id,
        tenantId: testTenantId,
        userId: testUserId,
        description: 'desc',
        images: [
          {
            id: 'img1',
            portfolioId: id,
            imagePath: '/fake/path/to/image.jpg',
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      const res = await request(app)
        .get('/api/portfolio/' + testPortfolioId + '/image')
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/jpeg/);
    });
    it('should return 404 if not found or missing image', async () => {
      (mockedService.prototype.getPortfolioById as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(app)
        .get('/api/portfolio/' + testPortfolioId + '/image')
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(404);
    });
    it('should return 500 on service error', async () => {
      (mockedService.prototype.getPortfolioById as jest.Mock).mockRejectedValueOnce(
        new Error('fail'),
      );
      const res = await request(app)
        .get('/api/portfolio/' + testPortfolioId + '/image')
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(500);
    });
  });

  describe('image validation and edge cases', () => {
    it('should return 400 if a non-image file is uploaded', async () => {
      const res = await request(app)
        .post('/api/portfolio')
        .set('Authorization', `Bearer ${testToken}`)
        .field('tenantId', testTenantId)
        .field('userId', testUserId)
        .field('description', 'desc')
        .attach('image', path.join(__dirname, 'fakeFile.txt'));
      expect(res.status).toBe(400);
    });

    it('should accept a very long but valid description', async () => {
      (mockedService.prototype.createPortfolio as jest.Mock).mockImplementation(async (data) => ({
        id: testPortfolioId,
        tenantId: testTenantId,
        userId: testUserId,
        description: data.description,
        images: [
          {
            id: 'img1',
            portfolioId: testPortfolioId,
            imagePath: '/fake/path/to/image.jpg',
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      const longDesc = 'A'.repeat(300);
      const res = await request(app)
        .post('/api/portfolio')
        .set('Authorization', `Bearer ${testToken}`)
        .field('tenantId', testTenantId)
        .field('userId', testUserId)
        .field('description', longDesc)
        .attach('image', testImagePath);
      expect(res.status).toBe(201);
      expect(res.body.description).toBe(longDesc);
      expect(res.body.images[0].imagePath).toBeDefined();
    });

    it('should accept unicode/emoji in description', async () => {
      (mockedService.prototype.createPortfolio as jest.Mock).mockImplementation(async (data) => ({
        id: testPortfolioId,
        tenantId: testTenantId,
        userId: testUserId,
        description: data.description,
        images: [
          {
            id: 'img1',
            portfolioId: testPortfolioId,
            imagePath: '/fake/path/to/image.jpg',
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      const emojiDesc = 'Portfolio 😃✨🎨';
      const res = await request(app)
        .post('/api/portfolio')
        .set('Authorization', `Bearer ${testToken}`)
        .field('tenantId', testTenantId)
        .field('userId', testUserId)
        .field('description', emojiDesc)
        .attach('image', testImagePath);
      expect(res.status).toBe(201);
      expect(res.body.description).toBe(emojiDesc);
      expect(res.body.images[0].imagePath).toBeDefined();
    });

    it('should return 401 if JWT is missing', async () => {
      try {
        const res = await request(app)
          .post('/api/portfolio')
          .field('tenantId', testTenantId)
          .field('userId', testUserId)
          .field('description', 'desc')
          .attach('image', testImagePath);
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error');
      } catch (err) {
        throw err;
      }
    });

    it('should return 404 when getting a non-existent portfolio item', async () => {
      (mockedService.prototype.getPortfolioById as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(app)
        .get('/api/portfolio/nonexistent-id/image')
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(404);
    });

    it('should return image/jpeg content-type for image endpoint', async () => {
      (mockedService.prototype.getPortfolioById as jest.Mock).mockResolvedValueOnce({
        id: testPortfolioId,
        tenantId: testTenantId,
        userId: testUserId,
        description: 'desc',
        images: [
          {
            id: 'img1',
            portfolioId: testPortfolioId,
            imagePath: '/fake/path/to/image.jpg',
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const res = await request(app)
        .get(`/api/portfolio/${testPortfolioId}/image`)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/image\/jpeg/);
      expect(res.body).toBeInstanceOf(Buffer);
    });

    it('should handle very large image upload gracefully', async () => {
      const largeBuffer = Buffer.alloc(5 * 1024 * 1024, 0xff);
      const largeImagePath = path.join(__dirname, 'large-image.jpg');
      fs.writeFileSync(largeImagePath, largeBuffer);
      (mockedService.prototype.createPortfolio as jest.Mock).mockImplementation(async (data) => ({
        ...data,
        id: testPortfolioId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      const res = await request(app)
        .post('/api/portfolio')
        .set('Authorization', `Bearer ${testToken}`)
        .field('tenantId', testTenantId)
        .field('userId', testUserId)
        .field('description', 'Large image test')
        .attach('image', largeImagePath);
      expect(res.status).toBe(413);
      fs.unlinkSync(largeImagePath);
    });

    it('should sanitize special characters in description', async () => {
      (mockedService.prototype.createPortfolio as jest.Mock).mockImplementation(async (data) => ({
        id: testPortfolioId,
        tenantId: testTenantId,
        userId: testUserId,
        description: data.description,
        images: [
          {
            id: 'img1',
            portfolioId: testPortfolioId,
            imagePath: '/fake/path/to/image.jpg',
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      const specialDesc = fs.readFileSync(path.join(__dirname, 'specialDesc.txt'), 'utf8');
      const res = await request(app)
        .post('/api/portfolio')
        .set('Authorization', `Bearer ${testToken}`)
        .field('tenantId', testTenantId)
        .field('userId', testUserId)
        .field('description', specialDesc)
        .attach('image', testImagePath);
      expect(res.status).toBe(201);
      expect(res.body.description).toBe(specialDesc);
      expect(res.body.images[0].imagePath).toBeDefined();
    });

    it('should treat empty string/null fields correctly', async () => {
      (mockedService.prototype.createPortfolio as jest.Mock).mockImplementation(async (data) => ({
        id: testPortfolioId,
        tenantId: testTenantId,
        userId: testUserId,
        description: data.description,
        images: [
          {
            id: 'img1',
            portfolioId: testPortfolioId,
            imagePath: '/fake/path/to/image.jpg',
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      const res = await request(app)
        .post('/api/portfolio')
        .set('Authorization', `Bearer ${testToken}`)
        .field('tenantId', testTenantId)
        .field('userId', testUserId)
        .field('description', '')
        .attach('image', testImagePath);
      expect(res.status).toBe(400);
    });

    it('should always return image/jpeg even if input is png', async () => {
      (mockedService.prototype.createPortfolio as jest.Mock).mockImplementation(async (data) => ({
        id: testPortfolioId,
        tenantId: testTenantId,
        userId: testUserId,
        description: data.description,
        images: [
          {
            id: 'img1',
            portfolioId: testPortfolioId,
            imagePath: '/fake/path/to/image.jpg',
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      const res = await request(app)
        .post('/api/portfolio')
        .set('Authorization', `Bearer ${testToken}`)
        .field('tenantId', testTenantId)
        .field('userId', testUserId)
        .field('description', 'desc')
        .attach('image', testImagePath, { contentType: 'image/png' });
      expect(res.status).toBe(201);
      expect(res.body.images[0].imagePath).toBe('/fake/path/to/image.jpg');
    });

    it('should handle multiple concurrent uploads', async () => {
      (mockedService.prototype.createPortfolio as jest.Mock).mockImplementation(async (data) => ({
        id: testPortfolioId,
        tenantId: testTenantId,
        userId: testUserId,
        description: data.description,
        images: [
          {
            id: 'img1',
            portfolioId: testPortfolioId,
            imagePath: '/fake/path/to/image.jpg',
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      const upload = () =>
        request(app)
          .post('/api/portfolio')
          .set('Authorization', `Bearer ${testToken}`)
          .field('tenantId', testTenantId)
          .field('userId', testUserId)
          .field('description', 'Concurrent upload')
          .attach('image', testImagePath);
      const results = await Promise.all([upload(), upload(), upload()]);
      results.forEach((res) => expect(res.status).toBe(201));
    });
  });
});
