import request from 'supertest';
import app from '../../app';
import { UserService } from '../../services/user.service';
jest.mock('../../services/user.service');
const mockedService = UserService as jest.Mocked<typeof UserService>;
const testUserId = 'test-user';
describe('User Controller', () => {
  describe('GET /user/:user_id/stats', () => {
    it('should get user stats', async () => {
      (mockedService.prototype as any).getUserStats = jest
        .fn()
        .mockResolvedValueOnce({
          businessCount: 2,
          customerCount: 3,
          activeBusiness: 1,
          activeCustomer: 2,
        });
      const res = await request(app).get(`/api/user/${testUserId}/stats`);
      expect(res.status).toBe(200);
      expect(res.body.businessCount).toBe(2);
      expect(res.body.customerCount).toBe(3);
      expect(res.body.activeBusiness).toBe(1);
      expect(res.body.activeCustomer).toBe(2);
    });
    it('should return 403 if forbidden', async () => {
      (mockedService.prototype as any).getUserStats = jest.fn().mockResolvedValueOnce(null as any);
      const res = await request(app).get(`/api/user/${testUserId}/stats`);
      expect(res.status).toBe(403);
    });
    it('should return 400 on error', async () => {
      (mockedService.prototype as any).getUserStats = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'));
      const res = await request(app).get(`/api/user/${testUserId}/stats`);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /user/register', () => {
    it('should register a new user', async () => {
      (mockedService.prototype as any).createUser = jest.fn().mockResolvedValueOnce({
        id: 'new-user',
        name: 'Test User',
        email: 'test@example.com',
        tenantId: 'test-tenant',
        roles: [{ id: 1, name: 'customer' }],
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerified: false,
        saasOwner: undefined,
        salonStaff: undefined,
        customer: { userId: 'new-user', loyaltyPoints: 0, registeredAt: new Date() },
      });
      const res = await request(app)
        .post('/api/user/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          tenantId: 'test-tenant',
          roles: [{ id: 1, name: 'customer' }],
        });
      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.roles[0].name).toBe('customer');
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it('should return 400 if missing fields', async () => {
      const res = await request(app).post('/api/user/register').send({ email: 'test@example.com' });
      expect(res.status).toBe(400);
    });

    it('should return 409 if email exists', async () => {
      (mockedService.prototype as any).createUser = jest.fn().mockImplementation(() => {
        const err: any = new Error('Email exists');
        err.code = 'P2002';
        throw err;
      });
      const res = await request(app)
        .post('/api/user/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          tenantId: 'test-tenant',
          roles: [{ id: 1, name: 'customer' }],
        });
      expect(res.status).toBe(409);
    });
  });
});
