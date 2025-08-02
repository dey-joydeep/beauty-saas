import request from 'supertest';
import app from '../../app';
import { ReviewService, Review } from '../../modules/review/review.service';
import { reviewServiceHolder } from '../../controllers/review.controller';
jest.mock('../../modules/review/review.service');
const mockedServiceInstance = new (ReviewService as any)() as jest.Mocked<ReviewService>;
const testSalonId = 'test-salon';
const testUserId = 'test-user';

// Helper: minimal mock Document fields for Review (must use type assertion to 'any' to avoid TS2352)
const mockDocumentFields: any = {
  _id: 'mockid',
  $assertPopulated: () => undefined,
  $clone: () => undefined,
  $getAllSubdocs: () => [],
  $ignore: () => undefined,
  $inc: () => undefined,
  $isDefault: () => false,
  $isDeleted: () => false,
  $isEmpty: () => false,
  $isValid: () => true,
  $locals: {},
  $markValid: () => undefined,
  $model: () => undefined,
  $op: undefined,
  $session: () => undefined,
  $set: () => undefined,
  $setPopulated: () => undefined,
  $toObject: () => ({}),
  $where: () => undefined,
  base: undefined,
  collection: undefined,
  db: undefined,
  delete: () => undefined,
  depopulate: () => undefined,
  directModifiedPaths: () => [],
  equals: () => true,
  errors: undefined,
  get: () => undefined,
  increment: () => undefined,
  init: () => undefined,
  inspect: () => '',
  invalidate: () => undefined,
  isDirectModified: () => false,
  isDirectSelected: () => false,
  isInit: () => true,
  isModified: () => false,
  isNew: false,
  isSelected: () => true,
  markModified: () => undefined,
  modifiedPaths: () => [],
  overwrite: () => undefined,
  parent: () => undefined,
  populate: () => undefined,
  populated: () => false,
  remove: () => undefined,
  replaceOne: () => undefined,
  save: () => undefined,
  schema: undefined,
  set: () => undefined,
  toJSON: () => ({}),
  toObject: () => ({}),
  unmarkModified: () => undefined,
  update: () => undefined,
  updateOne: () => undefined,
  validate: () => undefined,
  validateSync: () => undefined,
};

const mockReview: Review = {
  id: 'mockid',
  salonId: testSalonId,
  userId: testUserId,
  appointmentId: 'mockAppointmentId',
  rating: 5,
  comment: 'Great!',
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeAll(() => {
  // Inject the mocked service instance for all tests
  reviewServiceHolder.service = mockedServiceInstance;
});

describe('Review Controller', () => {
  describe('POST /api/salon/:salonId/review', () => {
    it('should add review', async () => {
      mockedServiceInstance.createReview.mockResolvedValueOnce(mockReview);
      const res = await request(app)
        .post(`/api/salon/${testSalonId}/review`)
        .send({ userId: testUserId, rating: 5, comment: 'Great!' });
      if (res.status !== 201) {
        // Log error for debugging
        console.error('Test Failure Details:', res.body);
      } else {
        // Log success body for debugging
        console.log('Test Success Details:', res.body);
      }
      expect(res.status).toBe(201);
      expect(res.body.salonId).toBe(testSalonId);
    });
    it('should return 400 on error', async () => {
      mockedServiceInstance.createReview.mockRejectedValueOnce(new Error('fail'));
      const res = await request(app)
        .post(`/api/salon/${testSalonId}/review`)
        .send({ userId: testUserId, rating: 5, comment: 'Great!' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/salon/:salonId/review edge cases', () => {
    it('should return 400 if userId is missing', async () => {
      const res = await request(app)
        .post(`/api/salon/${testSalonId}/review`)
        .send({ rating: 5, comment: 'Great!' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/user/i);
    });
    it('should return 400 if rating is missing', async () => {
      const res = await request(app)
        .post(`/api/salon/${testSalonId}/review`)
        .send({ userId: testUserId, comment: 'Great!' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/rating/i);
    });
    it('should return 400 if review text is missing', async () => {
      const res = await request(app)
        .post(`/api/salon/${testSalonId}/review`)
        .send({ userId: testUserId, rating: 5 });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/review/i);
    });
    it('should return 400 if rating is out of bounds', async () => {
      mockedServiceInstance.createReview.mockRejectedValueOnce(new Error('Rating must be 1-5'));
      const res = await request(app)
        .post(`/api/salon/${testSalonId}/review`)
        .send({ userId: testUserId, rating: 10, comment: 'Bad!' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/rating/i);
    });
  });

  describe('POST /api/salon/:salonId/review advanced edge cases', () => {
    it('should return 400 if review text is empty', async () => {
      const res = await request(app)
        .post(`/api/salon/${testSalonId}/review`)
        .send({ userId: testUserId, rating: 5, comment: '' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/review/i);
    });
    it('should return 400 if review text is only whitespace', async () => {
      const res = await request(app)
        .post(`/api/salon/${testSalonId}/review`)
        .send({ userId: testUserId, rating: 5, comment: '   ' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/review/i);
    });
    it('should return 400 if rating is not a number', async () => {
      const res = await request(app)
        .post(`/api/salon/${testSalonId}/review`)
        .send({ userId: testUserId, rating: 'five', comment: 'Great!' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/rating/i);
    });
  });

  describe('GET /api/salon/:salonId/reviews', () => {
    it('should get reviews', async () => {
      mockedServiceInstance.getReviews.mockResolvedValueOnce([mockReview]);
      const res = await request(app).get(`/api/salon/${testSalonId}/reviews`);
      expect(res.status).toBe(200);
      expect(res.body[0].salonId).toBe(testSalonId);
    });
    it('should return 400 on error', async () => {
      mockedServiceInstance.getReviews.mockRejectedValueOnce(new Error('fail'));
      const res = await request(app).get(`/api/salon/${testSalonId}/reviews`);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/salon/:salonId/reviews response structure', () => {
    it('should return expected review fields', async () => {
      mockedServiceInstance.getReviews.mockResolvedValueOnce([mockReview]);
      const res = await request(app).get(`/api/salon/${testSalonId}/reviews`);
      expect(res.status).toBe(200);
      expect(res.body[0]).toHaveProperty('salonId', testSalonId);
      expect(res.body[0]).toHaveProperty('userId', testUserId);
      expect(res.body[0]).toHaveProperty('rating', 5);
      expect(res.body[0]).toHaveProperty('comment', 'Great!');
      expect(res.body[0]).toHaveProperty('createdAt');
    });
  });

  describe('GET /api/salon/:salonId/reviews empty state', () => {
    it('should return empty array if no reviews exist', async () => {
      mockedServiceInstance.getReviews.mockResolvedValueOnce([]);
      const res = await request(app).get(`/api/salon/${testSalonId}/reviews`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });
});
