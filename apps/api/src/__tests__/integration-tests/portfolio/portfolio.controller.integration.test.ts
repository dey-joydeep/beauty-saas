import request from 'supertest';
import app from '../../../app';
import path from 'path';
import * as fs from 'fs';
import prisma from '../../prismaTestClient';
import jwt from 'jsonwebtoken';
import { createSolidColorImage } from '../../testHelper';

describe('Portfolio Controller Integration', () => {
  const testImagePath = path.join(__dirname, 'test-image.png');
  const testThumbnailPath = path.join(__dirname, 'test-thumbnail.jpg');
  const testTenantId = 'test-tenant';
  const testUserId = 'test-user';
  const testPortfolioId = 'test-portfolio';
  let testToken: string;
  let createdPortfolioId: string;

  beforeAll(async () => {
    // Setup test data
    await prisma.tenant.upsert({
      where: { id: testTenantId },
      update: {},
      create: { 
        id: testTenantId, 
        name: 'Test Tenant', 
        email: 'test-tenant@example.com',
        // Removed subscriptionStatus as it's not in the schema
        // Add any other required fields from the Tenant model if needed
      },
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

    // Create test images
    await Promise.all([
      createSolidColorImage(testImagePath, 800, 600, [255, 0, 0, 255]),
      createSolidColorImage(testThumbnailPath, 200, 150, [0, 0, 255, 255])
    ]);

    // Generate JWT token
    testToken = jwt.sign(
      { 
        sub: testUserId, 
        tenantId: testTenantId, 
        roles: ['owner'],
        email: 'test@example.com'
      },
      process.env['JWT_SECRET'] || 'testsecret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Cleanup test files
    [testImagePath, testThumbnailPath].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });

    // Cleanup database
    await prisma.portfolio.deleteMany({ where: { tenantId: testTenantId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await prisma.tenant.delete({ where: { id: testTenantId } });
    await prisma.$disconnect();
  });

  describe('Portfolio CRUD Operations', () => {
    it('should create a new portfolio item with image', async () => {
      const response = await request(app)
        .post('/api/portfolio')
        .set('Authorization', `Bearer ${testToken}`)
        .field('title', 'Test Portfolio')
        .field('description', 'Test Description')
        .field('tenantId', testTenantId)
        .field('userId', testUserId)
        .attach('image', testImagePath);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Portfolio');
      expect(response.body.images).toHaveLength(1);
      
      // Save the ID for subsequent tests
      createdPortfolioId = response.body.id;
    });

    it('should get all portfolio items', async () => {
      const response = await request(app)
        .get('/api/portfolio')
        .set('Authorization', `Bearer ${testToken}`)
        .query({ tenantId: testTenantId });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
    });

    it('should get a single portfolio item by ID', async () => {
      const response = await request(app)
        .get(`/api/portfolio/${createdPortfolioId}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', createdPortfolioId);
    });

    it('should update a portfolio item', async () => {
      const updatedTitle = 'Updated Portfolio Title';
      const response = await request(app)
        .put(`/api/portfolio/${createdPortfolioId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          title: updatedTitle,
          description: 'Updated description',
          tenantId: testTenantId
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updatedTitle);
    });

    it('should delete a portfolio item', async () => {
      const response = await request(app)
        .delete(`/api/portfolio/${createdPortfolioId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ tenantId: testTenantId });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Image Upload Validation', () => {
    it('should return 400 for non-image file upload', async () => {
      const tempFilePath = path.join(__dirname, 'test.txt');
      fs.writeFileSync(tempFilePath, 'This is not an image');

      try {
        const response = await request(app)
          .post('/api/portfolio')
          .set('Authorization', `Bearer ${testToken}`)
          .field('title', 'Invalid File')
          .field('tenantId', testTenantId)
          .field('userId', testUserId)
          .attach('image', tempFilePath);

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/image file/i);
      } finally {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/portfolio')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('image', testImagePath);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/required/i);
    });
  });

  describe('Authentication & Authorization', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/portfolio')
        .query({ tenantId: testTenantId });

      expect(response.status).toBe(401);
    });

    it('should return 403 for unauthorized tenant access', async () => {
      const otherTenantToken = jwt.sign(
        { sub: 'other-user', tenantId: 'other-tenant', roles: ['owner'] },
        process.env['JWT_SECRET'] || 'testsecret'
      );

      const response = await request(app)
        .get('/api/portfolio')
        .set('Authorization', `Bearer ${otherTenantToken}`)
        .query({ tenantId: testTenantId });

      expect([403, 404]).toContain(response.status);
    });
  });
});
