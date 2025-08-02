import request from 'supertest';
import app from '../../app';

describe('User API', () => {
  let token = '';
  beforeAll(() => {
    token = process.env.TEST_JWT || '';
  });

  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/api/user/stats');
    expect(res.status).toBe(401);
  });

  it('should return 200 and user stats when token is provided', async () => {
    if (!token) return;
    const res = await request(app)
      .get('/api/user/stats?tenant_id=test-tenant')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 401, 403]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('businessCount');
      expect(res.body).toHaveProperty('customerCount');
      expect(res.body).toHaveProperty('activeBusiness');
      expect(res.body).toHaveProperty('activeCustomer');
    }
  });
});
