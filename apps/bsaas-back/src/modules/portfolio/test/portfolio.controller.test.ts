// moved from __tests__/portfolio/portfolio.controller.test.ts
import request from 'supertest';
import app from '../../../app';
import * as path from 'path';
import * as fs from 'fs';
import prisma from '../../../prismaTestClient';
import { PortfolioService } from '../portfolio.service';
import jwt from 'jsonwebtoken';
import { createSolidColorImage } from '../../../testHelper';

jest.mock('../portfolio.service');

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
    if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'changeme';
    if (!process.env.BASE_IMAGE_PATH)
      process.env.BASE_IMAGE_PATH = 'E:/data/bsaas/salon/${salonId}/';
    if (!process.env.PORTFOLIO_IMAGE_PATH)
      process.env.PORTFOLIO_IMAGE_PATH = 'portfolio/${portfolioId}/images';
    jest.spyOn(fs, 'existsSync').mockImplementation((p) => {
      if (typeof p === 'string' && p.includes('fake/path/to/image.jpg')) return true;
      return false; // Always return false for other paths to avoid recursion
    });
    await prisma.tenant.upsert({
      where: { id: testTenantId },
      update: {},
      create: {
        id: testTenantId,
        name: 'Test Tenant',
        email: 'test@tenant.com',
        phone: '1234567890',
        // address: '123 Test St',
        // created_at: new Date(),
        // updated_at: new Date(),
        // primary_color: null,
        // secondary_color: null,
        // accent_color: null,
      },
    });
  });
  // ...rest of the test code...
});
