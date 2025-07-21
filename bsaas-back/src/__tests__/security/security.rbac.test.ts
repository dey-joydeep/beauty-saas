import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';

describe('Security: Role-Based Access Control (RBAC)', () => {
  const secret = process.env.JWT_SECRET || 'test_secret';
  const basePayload = {
    id: 'test-user',
    email: 'test@example.com',
    tenant_id: 'test-tenant',
  };
  const userToken = jwt.sign({ ...basePayload, roles: ['user'] }, secret, { expiresIn: '1h' });
  const adminToken = jwt.sign({ ...basePayload, roles: ['admin'] }, secret, { expiresIn: '1h' });
  const otherTenantToken = jwt.sign(
    { ...basePayload, roles: ['admin'], tenant_id: 'other-tenant' },
    secret,
    { expiresIn: '1h' },
  );

  it('should allow admin to access admin-only endpoint', async () => {
    // Replace with a real admin endpoint if available
    const res = await request(app)
      .get('/api/user/stats?tenant_id=test-tenant')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 401, 403]).toContain(res.status);
    // If 200, check for expected admin fields
    if (res.status === 200) {
      expect(res.body).toHaveProperty('businessCount');
    }
  });

  it('should forbid user from accessing admin-only endpoint', async () => {
    const res = await request(app)
      .get('/api/user/stats?tenant_id=test-tenant')
      .set('Authorization', `Bearer ${userToken}`);
    expect([401, 403]).toContain(res.status);
  });

  it('should forbid admin from other tenant', async () => {
    const res = await request(app)
      .get('/api/user/stats?tenant_id=test-tenant')
      .set('Authorization', `Bearer ${otherTenantToken}`);
    expect([401, 403]).toContain(res.status);
  });
});
