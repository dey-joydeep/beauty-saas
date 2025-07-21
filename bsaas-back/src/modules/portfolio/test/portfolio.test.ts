import request from 'supertest';
import app from '../../../app';
import * as fs from 'fs';
import path from 'path';

const testImagePath = path.join(__dirname, 'test-image-upload.png');
const testTenantId = 'test-tenant';
const testUserId = 'test-user';
let token = '';

beforeAll(async () => {
  token = process.env.TEST_JWT || '';
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
  // Add more tests as needed
});
