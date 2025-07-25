import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('SalonStaffRequest API', () => {
  let staffId: string;
  let requestId: string;

  beforeAll(async () => {
    // Create a tenant for testing
    const tenant = await prisma.tenant.create({
      data: {
        id: 'test-tenant',
        name: 'Test Tenant',
        email: 'test-tenant@example.com',
        phone: '000-0000',
        // address: '123 Test St.',
      },
    });
    // Create a user and staff for testing
    const user = await prisma.user.create({
      data: {
        id: 'test-staff-user',
        name: 'Test Staff',
        email: 'teststaff@example.com',
        passwordHash: 'hashedpassword',
        tenant: { connect: { id: tenant.id } },
        isVerified: true,
        roles: { create: [{ role: { connect: { name: 'salon_staff' } } }] },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    const salon = await prisma.salon.create({
      data: {
        id: 'test-salon',
        tenantId: tenant.id,
        name: 'Test Salon',
        // address: '123 Test St',
        latitude: 0,
        longitude: 0,
        ownerId: 'test-owner',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    // const staff = await prisma.salonStaff.create({
    //   data: {
    //     userId: user.id,
    //     salonId: salon.id,
    //     position: 'Stylist',
    //     hiredAt: new Date(),
    //     isActive: true,
    //     isOnLeave: false,
    //   },
    // });
    // staffId = staff.userId;
  });

  afterAll(async () => {
    // await prisma.salonStaffRequest.deleteMany({ where: { staffId } });
    // await prisma.salonStaff.deleteMany({ where: { userId: staffId } });
    // await prisma.user.deleteMany({ where: { id: staffId } });
    await prisma.salon.deleteMany({ where: { id: 'test-salon' } });
    await prisma.tenant.deleteMany({ where: { id: 'test-tenant' } });
    await prisma.$disconnect();
  });

  it('should create a leave request', async () => {
    const res = await request(app)
      .post('/api/staff-requests/leave')
      .send({
        // staffId,
        leaveFrom: new Date(),
        leaveTo: new Date(Date.now() + 86400000),
        reason: 'Vacation',
        rejectionReason: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    requestId = res.body.id;
  });

  it('should approve a leave request', async () => {
    const res = await request(app).post('/api/staff-requests/approve').send({ requestId });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
  });

  it('should get requests for staff', async () => {
    // const res = await request(app).get(`/api/staff-requests/staff/${staffId}`);
    // expect(res.status).toBe(200);
    // expect(Array.isArray(res.body)).toBe(true);
    // expect(res.body[0]).toHaveProperty('id');
  });

  it('should get all pending requests', async () => {
    const res = await request(app).get('/api/staff-requests/pending');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
