// Placeholder for controller unit tests (mocked service)

import request from 'supertest';
import app from '../../../app';
import path from 'path';
import * as fs from 'fs';
import { PortfolioService } from '../../../services/portfolio.service';
import jwt from 'jsonwebtoken';
import { createSolidColorImage } from '../../testHelper';

jest.mock('../../../services/portfolio.service');

const mockedService = PortfolioService as jest.MockedClass<typeof PortfolioService>;

const testImagePath = path.join(__dirname, '../../portfolio/test-image.png');
const testSalonId = 'test-salon';
const testStaffId = 'test-staff';
const testPortfolioId = 'test-portfolio';

const testToken = jwt.sign(
  { id: testStaffId, salonId: testSalonId /* roles: ['owner'] */ },
  process.env.JWT_SECRET || 'testsecret',
);

describe('Portfolio Controller Unit', () => {
  beforeAll(async () => {
    await createSolidColorImage(testImagePath, 10, 10, [255, 0, 0, 255]);
  });
  afterAll(() => {
    fs.unlinkSync(testImagePath);
  });

  it('should return 201 on valid image upload (mocked)', async () => {
    (mockedService.prototype.createPortfolio as jest.Mock).mockImplementation(async (data) => ({
      id: testPortfolioId,
      salonId: testSalonId,
      userId: testStaffId,
      description: data.description || null,
      images: [
        {
          id: 'img1',
          portfolioId: testPortfolioId,
          imagePath: '/fake/path/to/image.jpg',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    const res = await request(app)
      .post('/api/portfolio')
      .set('Authorization', `Bearer ${testToken}`)
      .field('tenantId', testSalonId)
      .field('userId', testStaffId)
      .field('description', 'desc')
      .attach('image', testImagePath);
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(testPortfolioId);
    expect(res.body.images && res.body.images.length).toBeGreaterThan(0);
    expect(res.body.images[0].imagePath).toBeDefined();
  });

  it('should return 400 if image file is missing (mocked)', async () => {
    const res = await request(app)
      .post('/api/portfolio')
      .set('Authorization', `Bearer ${testToken}`)
      .field('tenantId', testSalonId)
      .field('userId', testStaffId)
      .field('description', 'desc');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/image file/i);
  });

  it('should return 500 on service error (mocked)', async () => {
    (mockedService.prototype.createPortfolio as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const res = await request(app)
      .post('/api/portfolio')
      .set('Authorization', `Bearer ${testToken}`)
      .field('tenantId', testSalonId)
      .field('userId', testStaffId)
      .field('description', 'desc')
      .attach('image', testImagePath);
    expect(res.status).toBe(500);
  });

  it('should return 200 and sanitized items on getPortfolios (mocked)', async () => {
    (mockedService.prototype.getPortfolios as jest.Mock).mockImplementation(async () => [
      {
        id: testPortfolioId,
        salonId: testSalonId,
        userId: testStaffId,
        description: 'desc',
        images: [
          {
            id: 'img1',
            portfolioId: testPortfolioId,
            imagePath: '/fake/path/to/image.jpg',
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
    const res = await request(app)
      .get('/api/portfolio?salonId=' + testSalonId)
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.status).toBe(200);
    expect(res.body[0].id).toBe(testPortfolioId);
    expect(res.body[0].images && res.body[0].images.length).toBeGreaterThan(0);
    expect(res.body[0].images[0].imagePath).toBeDefined();
    expect((res.body[0] as any).description).toBe('desc');
  });

  it('should return 500 on service error for getPortfolios (mocked)', async () => {
    (mockedService.prototype.getPortfolios as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const res = await request(app)
      .get('/api/portfolio?salonId=' + testSalonId)
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.status).toBe(500);
  });

  it('should update description and/or image (mocked)', async () => {
    (mockedService.prototype.updatePortfolio as jest.Mock).mockImplementation(async (id, data) => ({
      id: id,
      salonId: testSalonId,
      userId: testStaffId,
      description: data.description || null,
      images: [
        {
          id: 'img1',
          portfolioId: testPortfolioId,
          imagePath: '/fake/path/to/image.jpg',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    const res = await request(app)
      .put(`/api/portfolio/${testPortfolioId}`)
      .set('Authorization', `Bearer ${testToken}`)
      .field('tenantId', testSalonId)
      .field('userId', testStaffId)
      .field('description', 'updated desc')
      .attach('image', testImagePath);
    expect(res.status).toBe(200);
    expect(res.body.description).toBe('updated desc');
  });

  it('should return 500 on service error for updatePortfolio (mocked)', async () => {
    (mockedService.prototype.updatePortfolio as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const res = await request(app)
      .put(`/api/portfolio/${testPortfolioId}`)
      .set('Authorization', `Bearer ${testToken}`)
      .field('tenantId', testSalonId)
      .field('userId', testStaffId)
      .field('description', 'updated desc')
      .attach('image', testImagePath);
    expect(res.status).toBe(500);
  });

  it('should delete and return 204 (mocked)', async () => {
    (mockedService.prototype.deletePortfolio as jest.Mock).mockImplementation(async (id) => ({
      id: id,
      salonId: testSalonId,
      userId: testStaffId,
      description: 'desc',
      images: [
        {
          id: 'img1',
          portfolioId: testPortfolioId,
          imagePath: '/fake/path/to/image.jpg',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    const res = await request(app)
      .delete('/api/portfolio/' + testPortfolioId)
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.status).toBe(204);
  });

  it('should return 500 on service error for deletePortfolio (mocked)', async () => {
    (mockedService.prototype.deletePortfolio as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const res = await request(app)
      .delete('/api/portfolio/' + testPortfolioId)
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.status).toBe(500);
  });

  it('should return image if found (mocked)', async () => {
    (mockedService.prototype.getPortfolioById as jest.Mock).mockImplementation(async (id) => ({
      id: id,
      salonId: testSalonId,
      userId: testStaffId,
      description: 'desc',
      images: [
        {
          id: 'img1',
          portfolioId: testPortfolioId,
          imagePath: '/fake/path/to/image.jpg',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    const res = await request(app)
      .get('/api/portfolio/' + testPortfolioId + '/image')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/image\/jpeg/);
    expect(res.body).toBeInstanceOf(Buffer);
  });

  it('should return 404 when getting a non-existent portfolio item (mocked)', async () => {
    (mockedService.prototype.getPortfolioById as jest.Mock).mockResolvedValueOnce(null);
    const res = await request(app)
      .get('/api/portfolio/nonexistent-id/image')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.status).toBe(404);
  });

  it('should return 500 on service error for getPortfolioImage (mocked)', async () => {
    (mockedService.prototype.getPortfolioById as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );
    const res = await request(app)
      .get('/api/portfolio/' + testPortfolioId + '/image')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.status).toBe(500);
  });
});
