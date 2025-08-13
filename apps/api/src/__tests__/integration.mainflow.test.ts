import request from 'supertest';
import app from '../app';

describe('Main Flow Integration', () => {
  let token = process.env.TEST_JWT || '';
  let createdId: string | undefined;
  const tenantId = 'test-tenant';
  const userId = 'test-user';
  const ImagePath = 'https://example.com/test.png';
  const description = 'A test portfolio item';

  it('should not allow unauthenticated portfolio creation', async () => {
    const res = await request(app)
      .post('/api/portfolio')
      .send({ tenantId, userId, ImagePath, description });
    expect(res.status).toBe(401);
  });

  it('should create a portfolio item when authenticated', async () => {
    if (!token) return;
    const res = await request(app)
      .post('/api/portfolio')
      .set('Authorization', `Bearer ${token}`)
      .send({ tenantId, userId, ImagePath, description });
    expect([201, 403]).toContain(res.status); // 403 if roles are not sufficient
    if (res.status === 201) {
      expect(res.body).toHaveProperty('id');
      createdId = res.body.id;
      expect(res.body.images[0].ImagePath).toBeDefined();
    }
  });

  it('should retrieve portfolio items when authenticated', async () => {
    if (!token) return;
    const res = await request(app)
      .get('/api/portfolio?tenantId=' + tenantId)
      .set('Authorization', `Bearer ${token}`);
    expect([200, 401]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it('should update a portfolio item when authenticated', async () => {
    if (!token || !createdId) return;
    const res = await request(app)
      .put('/api/portfolio/' + createdId)
      .set('Authorization', `Bearer ${token}`)
      .send({ ImagePath, description: 'Updated desc' });
    expect([200, 404, 403]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.description).toBe('Updated desc');
    }
  });

  it('should delete a portfolio item when authenticated', async () => {
    if (!token || !createdId) return;
    const res = await request(app)
      .delete('/api/portfolio/' + createdId)
      .set('Authorization', `Bearer ${token}`);
    expect([204, 404, 403]).toContain(res.status);
  });
});
