// moved from __tests__/salon-staff-request.controller.test.ts
import request from 'supertest';
import app from '../../../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('SalonStaffRequest API', () => {
  let staffId: string;
  let requestId: string;

  beforeAll(async () => {
    // Create a tenant for testing
    const tenant = await prisma.tenant.create({
      data: {
        id: 'testTenant',
        name: 'Test Tenant',
        email: 'test-tenant@example.com',
        phone: '000-0000',
        // address: '123 Test St.',
        // created_at: new Date(),
        // updated_at: new Date(),
        // primary_color: null,
        // secondary_color: null,
        // accent_color: null,
      },
    });
    // Create a user and staff for testing
    const user = await prisma.user.create({
      data: {
        id: 'testStaffUser',
        name: 'Test Staff',
        email: 'teststaff@example.com',
        passwordHash: 'hashedpassword',
        tenant: { connect: { id: tenant.id } },
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: { create: [{ role: { connect: { name: 'salon_staff' } } }] },
        phone: null,
      },
    });
    const salon = await prisma.salon.create({
      data: {
        id: 'testSalon',
        tenantId: tenant.id,
        name: 'Test Salon',
        // address: '123 Test St',
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: user.id,
        // zipCode: '00000',
        // city: 'Test City',
        latitude: 0,
        longitude: 0,
        imageUrl: null,
      },
    });
    staffId = user.id;
    // ...rest of setup code
  });

  // ...rest of the test code for all endpoints, using camelCase for all model/interface members...
});
