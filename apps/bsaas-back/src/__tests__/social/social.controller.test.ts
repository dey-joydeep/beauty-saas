import request from 'supertest';
import app from '../../app';
import { SocialService } from '../../services/social.service';

// Ensure jest mock is typed correctly and reset mocks between tests
jest.mock('../../services/social.service');

// Extend the SocialService mock type to include all methods used in tests
interface SocialServiceMock extends jest.MockedClass<typeof SocialService> {
  prototype: {
    createSocial: jest.Mock;
    getSocialsForUser: jest.Mock;
  };
}

const mockedService = SocialService as unknown as SocialServiceMock;
mockedService.prototype.createSocial = jest.fn();
mockedService.prototype.getSocialsForUser = jest.fn();

const testSocialId = 'test-social';
const testUserId = 'test-user';

describe('Social Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /social', () => {
    it('should create social link', async () => {
      mockedService.prototype.createSocial.mockResolvedValueOnce({
        id: testSocialId,
        userId: testUserId,
        platform: 'instagram',
        handle: '@test',
        url: 'https://instagram.com/test',
      });
      const res = await request(app)
        .post('/api/social')
        .send({
          userId: testUserId,
          platform: 'instagram',
          handle: '@test',
          url: 'https://instagram.com/test',
        });
      expect(res.status).toBe(201);
      expect(res.body.id).toBe(testSocialId);
    });
    it('should return 400 on error', async () => {
      mockedService.prototype.createSocial.mockRejectedValueOnce(new Error('fail'));
      const res = await request(app)
        .post('/api/social')
        .send({
          userId: testUserId,
          platform: 'instagram',
          handle: '@test',
          url: 'https://instagram.com/test',
        });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /user/:user_id/social', () => {
    it('should get user socials', async () => {
      mockedService.prototype.getSocialsForUser.mockResolvedValueOnce([
        {
          id: testSocialId,
          userId: testUserId,
          platform: 'instagram',
          handle: '@test',
          url: 'https://instagram.com/test',
        },
      ]);
      const res = await request(app).get(`/api/user/${testUserId}/social`);
      expect(res.status).toBe(200);
      expect(res.body[0].id).toBe(testSocialId);
    });
    it('should return 400 on error', async () => {
      mockedService.prototype.getSocialsForUser.mockRejectedValueOnce(new Error('fail'));
      const res = await request(app).get(`/api/user/${testUserId}/social`);
      expect(res.status).toBe(400);
    });
  });
});
