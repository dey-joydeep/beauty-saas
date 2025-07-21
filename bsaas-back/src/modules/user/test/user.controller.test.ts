// moved from __tests__/user/user.controller.test.ts
import request from 'supertest';
import app from '../../../app';
import { UserService } from '../user.service';
jest.mock('../user.service');
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
        // ...rest of mock
      });
      // ...rest of test
    });
  });
});
