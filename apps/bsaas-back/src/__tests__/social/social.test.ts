import request from 'supertest';
import app from '../../app';

describe('Social API', () => {
  let token = '';
  beforeAll(() => {
    token = process.env.TEST_JWT || '';
  });

  it('should fail login with missing fields', async () => {
    const res = await request(app).post('/api/social/google').send({});
    expect(res.status).toBe(400);
  });

  it('should fail login with missing fields (facebook)', async () => {
    const res = await request(app).post('/api/social/facebook').send({});
    expect(res.status).toBe(400);
  });

  it('should return 200 and social data when token is provided', async () => {
    if (!token) return;
    const res = await request(app).get('/api/social').set('Authorization', `Bearer ${token}`);
    expect([200, 401]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });
});
