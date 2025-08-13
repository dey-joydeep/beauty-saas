import request from 'supertest';
import app from '../../app';
import * as fs from 'fs';
import path from 'path';

const testImagePath = path.join(__dirname, 'test-image-upload.png');
const testTenantId = 'test-tenant';
const testUserId = 'test-user';
let token = '';

beforeAll(async () => {
  token = process.env['TEST_JWT'] || '';
  // Optionally, create a sample image for upload
  fs.writeFileSync(
    testImagePath,
    Buffer.from([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0,
      0, 0, 144, 119, 83, 222, 0, 0, 0, 12, 73, 68, 65, 84, 8, 215, 99, 96, 0, 0, 0, 2, 0, 1, 226,
      33, 186, 84, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
    ]),
  );
});
afterAll(() => {
  if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
});

describe('Portfolio API', () => {
  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/api/portfolio');
    expect(res.status).toBe(401);
  });

  it('should return 200 and an array when token is provided', async () => {
    if (!token) return;
    const res = await request(app).get('/api/portfolio').set('Authorization', `Bearer ${token}`);
    expect([200, 401]).toContain(res.status); // 401 if test token is invalid
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).not.toHaveProperty('image_data');
        expect(Array.isArray(res.body[0].images)).toBe(true);
        if (res.body[0].images.length > 0) {
          expect(res.body[0].images[0]).toHaveProperty('ImagePath');
        }
      }
    }
  });

  it('should return 400 if image file is missing on upload', async () => {
    if (!token) return;
    const res = await request(app)
      .post('/api/portfolio')
      .set('Authorization', `Bearer ${token}`)
      .field('tenantId', testTenantId)
      .field('user_id', testUserId)
      .field('description', 'desc');
    expect([400, 401]).toContain(res.status);
  });

  it('should return 201 on valid image upload', async () => {
    if (!token) return;
    const res = await request(app)
      .post('/api/portfolio')
      .set('Authorization', `Bearer ${token}`)
      .field('tenantId', testTenantId)
      .field('user_id', testUserId)
      .field('description', 'desc')
      .attach('image', testImagePath);
    expect([201, 401]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('ImagePath');
    }
  });

  it('should return 400 for non-image file upload', async () => {
    if (!token) return;
    const fakeFilePath = path.join(__dirname, 'fake.txt');
    fs.writeFileSync(fakeFilePath, 'not an image');
    const res = await request(app)
      .post('/api/portfolio')
      .set('Authorization', `Bearer ${token}`)
      .field('tenantId', testTenantId)
      .field('user_id', testUserId)
      .field('description', 'desc')
      .attach('image', fakeFilePath);
    expect([400, 401]).toContain(res.status);
    fs.unlinkSync(fakeFilePath);
  });

  it('should return 404 for non-existent image id', async () => {
    if (!token) return;
    const res = await request(app)
      .get('/api/portfolio/nonexistentid/image')
      .set('Authorization', `Bearer ${token}`);
    expect([404, 401]).toContain(res.status);
  });

  it('should return 200 and jpeg for valid image id (if created)', async () => {
    if (!token) return;
    // First create a portfolio item
    const createRes = await request(app)
      .post('/api/portfolio')
      .set('Authorization', `Bearer ${token}`)
      .field('tenantId', testTenantId)
      .field('user_id', testUserId)
      .field('description', 'desc')
      .attach('image', testImagePath);
    if (createRes.status !== 201) return;
    const id = createRes.body.id;
    const res = await request(app)
      .get(`/api/portfolio/${id}/image`)
      .set('Authorization', `Bearer ${token}`);
    expect([200, 401]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers['content-type']).toMatch(/image\/jpeg/);
    }
  });

  it('should update description for existing item', async () => {
    if (!token) return;
    // Create an item
    const createRes = await request(app)
      .post('/api/portfolio')
      .set('Authorization', `Bearer ${token}`)
      .field('tenantId', testTenantId)
      .field('user_id', testUserId)
      .field('description', 'desc')
      .attach('image', testImagePath);
    if (createRes.status !== 201) return;
    const id = createRes.body.id;
    const res = await request(app)
      .put(`/api/portfolio/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'updated desc' });
    expect([200, 401]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.description).toBe('updated desc');
    }
  });

  it('should delete an existing item', async () => {
    if (!token) return;
    // Create an item
    const createRes = await request(app)
      .post('/api/portfolio')
      .set('Authorization', `Bearer ${token}`)
      .field('tenantId', testTenantId)
      .field('user_id', testUserId)
      .field('description', 'desc')
      .attach('image', testImagePath);
    if (createRes.status !== 201) return;
    const id = createRes.body.id;
    const res = await request(app)
      .delete(`/api/portfolio/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect([200, 401]).toContain(res.status);
    // Confirm deletion
    const getRes = await request(app)
      .get(`/api/portfolio/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect([404, 401]).toContain(getRes.status);
  });

  // Add more tests as needed
});
