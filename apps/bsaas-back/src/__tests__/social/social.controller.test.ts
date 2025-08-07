import request from 'supertest';
import app from '../../app';
import { SocialService } from '../../modules/social/social.service';

// Mock the SocialService
jest.mock('../../modules/social/social.service');

// Create a typed mock of the SocialService
const mockedSocialService = {
  getSocials: jest.fn(),
  getSocialById: jest.fn(),
  createSocial: jest.fn(),
  updateSocial: jest.fn(),
  deleteSocial: jest.fn(),
} as jest.Mocked<SocialService>;

// Set up the mock implementation
(SocialService as jest.Mock).mockImplementation(() => mockedSocialService);

const testSocialId = 'test-social';
const testUserId = 'test-user';
const testTenantId = 'test-tenant';

// Mock social data for testing
const mockSocial = {
  id: testSocialId,
  userId: testUserId,
  platform: 'instagram',
  handle: '@test',
  url: 'https://instagram.com/test',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Social Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /social', () => {
    it('should create social link', async () => {
      // Mock the createSocial method
      mockedSocialService.createSocial.mockResolvedValueOnce(mockSocial);

      const response = await request(app)
        .post('/api/social')
        .send({
          userId: testUserId,
          platform: 'instagram',
          handle: '@test',
          url: 'https://instagram.com/test',
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: testSocialId,
        userId: testUserId,
        platform: 'instagram',
        handle: '@test',
      });
      expect(mockedSocialService.createSocial).toHaveBeenCalledWith({
        userId: testUserId,
        platform: 'instagram',
        handle: '@test',
        url: 'https://instagram.com/test',
      });
    });

    it('should return 400 on error', async () => {
      // Mock the createSocial method to reject
      mockedSocialService.createSocial.mockRejectedValueOnce(new Error('Failed to create social'));

      const response = await request(app)
        .post('/api/social')
        .send({
          userId: testUserId,
          platform: 'instagram',
          handle: '@test',
          url: 'https://instagram.com/test',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /user/:user_id/social', () => {
    it('should get user socials', async () => {
      // Mock the getSocials method with a filter
      mockedSocialService.getSocials.mockResolvedValueOnce([mockSocial]);

      const response = await request(app).get(`/api/user/${testUserId}/social`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toMatchObject({
        id: testSocialId,
        userId: testUserId,
        platform: 'instagram',
      });
      expect(mockedSocialService.getSocials).toHaveBeenCalledWith({ userId: testUserId });
    });

    it('should return 400 on error', async () => {
      // Mock the getSocials method to reject
      mockedSocialService.getSocials.mockRejectedValueOnce(new Error('Failed to fetch socials'));

      const response = await request(app).get(`/api/user/${testUserId}/social`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
});
