import request from 'supertest';
import app from '../../app';
import { SalonService } from '../../modules/salon/salon.service';

// Inline Salon type to avoid namespace/type import issues
// and match project-wide camelCase convention
type Salon = {
  id: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  services: any[];
  ownerId: string;
  imageUrl?: string;
};

type GetSalonByIdParams = { salonId: string };
type CreateSalonParams = {
  name: string;
  address: string;
  zipCode: string;
  city: string;
  latitude: number;
  longitude: number;
  ownerId: string;
};
type UpdateSalonParams = {
  salonId: string;
  name?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
};
type DeleteSalonParams = { salonId: string };

jest.mock('../../modules/salon/salon.service');

const mockedService = SalonService as jest.MockedClass<typeof SalonService>;
(mockedService.prototype as any).createSalon = jest.fn();
(mockedService.prototype as any).getSalonById = jest.fn();
(mockedService.prototype as any).updateSalon = jest.fn();
(mockedService.prototype as any).deleteSalon = jest.fn();
(mockedService.prototype as any).getAllSalons = jest.fn();
(mockedService.prototype as any).searchSalons = jest.fn();
(mockedService.prototype as any).getTopSalons = jest.fn();
(mockedService.prototype as any).getAverageRatingForSalon = jest.fn();

const testSalonId = 'test-salon';

// Helper: Complete Salon object for mock returns
const mockSalon: Salon = {
  id: testSalonId,
  name: 'Salon A',
  address: '123 St',
  city: 'City',
  zipCode: '12345',
  latitude: 0,
  longitude: 0,
  services: [],
  ownerId: 'owner-id',
  imageUrl: undefined,
};

describe('Salon Controller', () => {
  describe('GET /salon/search', () => {
    it('should return salons', async () => {
      (mockedService.prototype as any).searchSalons.mockResolvedValueOnce({
        results: [mockSalon],
        total: 1,
      });
      const res = await request(app).get('/api/salon/search?q=Salon');
      expect(res.status).toBe(200);
      expect(res.body.results[0].id).toBe(testSalonId);
    });
    it('should return 400 on error', async () => {
      (mockedService.prototype as any).searchSalons.mockRejectedValueOnce(new Error('fail'));
      const res = await request(app).get('/api/salon/search?q=Salon');
      expect(res.status).toBe(400);
    });
  });
  describe('GET /salon/:salon_id', () => {
    it('should get salon details', async () => {
      (mockedService.prototype as any).getSalonById.mockImplementationOnce(
        (params: GetSalonByIdParams) => Promise.resolve(mockSalon),
      );
      const res = await request(app).get(`/api/salon/${testSalonId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(testSalonId);
    });
    it('should return 404 if not found', async () => {
      (mockedService.prototype as any).getSalonById.mockImplementationOnce(
        (params: GetSalonByIdParams) => Promise.resolve(null),
      );
      const res = await request(app).get(`/api/salon/${testSalonId}`);
      expect(res.status).toBe(404);
    });
    it('should return 400 on error', async () => {
      (mockedService.prototype as any).getSalonById.mockImplementationOnce(
        (params: GetSalonByIdParams) => Promise.reject(new Error('fail')),
      );
      const res = await request(app).get(`/api/salon/${testSalonId}`);
      expect(res.status).toBe(400);
    });
  });
  describe('GET /salon/top', () => {
    it('should get top salons', async () => {
      (mockedService.prototype as any).getTopSalons.mockResolvedValueOnce([mockSalon]);
      const res = await request(app).get('/api/salon/top');
      expect(res.status).toBe(200);
      expect(res.body[0].id).toBe(testSalonId);
    });
    it('should return 400 on error', async () => {
      (mockedService.prototype as any).getTopSalons.mockRejectedValueOnce(new Error('fail'));
      const res = await request(app).get('/api/salon/top');
      expect(res.status).toBe(400);
    });
  });
  describe('POST /salon', () => {
    it('should create a salon', async () => {
      (mockedService.prototype as any).createSalon.mockImplementationOnce(
        (params: CreateSalonParams) => Promise.resolve(mockSalon),
      );
      const res = await request(app)
        .post('/api/salon')
        .send({
          name: 'Salon New',
          address: '1 New St',
          city: 'Newcity',
          zipCode: '00000',
          latitude: 0,
          longitude: 0,
        });
      expect(res.status).toBe(201);
      expect(res.body.id).toBe(testSalonId);
    });
    it('should return 400 on validation error', async () => {
      (mockedService.prototype as any).createSalon.mockImplementationOnce(
        (params: CreateSalonParams) => Promise.reject(new Error('fail')),
      );
      const res = await request(app).post('/api/salon').send({ name: '' });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /salon/:salon_id', () => {
    it('should update a salon', async () => {
      (mockedService.prototype as any).updateSalon.mockImplementationOnce(
        (params: UpdateSalonParams) => Promise.resolve(mockSalon),
      );
      const res = await request(app)
        .put(`/api/salon/${testSalonId}`)
        .send({ name: 'Salon Updated' });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Salon A');
    });
    it('should return 404 if not found', async () => {
      (mockedService.prototype as any).updateSalon.mockImplementationOnce(
        (params: UpdateSalonParams) => Promise.resolve(null),
      );
      const res = await request(app)
        .put(`/api/salon/${testSalonId}`)
        .send({ name: 'Salon Updated' });
      expect(res.status).toBe(404);
    });
    it('should return 400 on error', async () => {
      (mockedService.prototype as any).updateSalon.mockImplementationOnce(
        (params: UpdateSalonParams) => Promise.reject(new Error('fail')),
      );
      const res = await request(app)
        .put(`/api/salon/${testSalonId}`)
        .send({ name: 'Salon Updated' });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /salon/:salon_id', () => {
    it('should delete a salon', async () => {
      (mockedService.prototype as any).deleteSalon.mockImplementationOnce(
        (params: DeleteSalonParams) => Promise.resolve(true),
      );
      const res = await request(app).delete(`/api/salon/${testSalonId}`);
      expect(res.status).toBe(200);
    });
    it('should return 404 if not found', async () => {
      (mockedService.prototype as any).deleteSalon.mockImplementationOnce(
        (params: DeleteSalonParams) => Promise.resolve(false),
      );
      const res = await request(app).delete(`/api/salon/${testSalonId}`);
      expect(res.status).toBe(404);
    });
    it('should return 400 on error', async () => {
      (mockedService.prototype as any).deleteSalon.mockImplementationOnce(
        (params: DeleteSalonParams) => Promise.reject(new Error('fail')),
      );
      const res = await request(app).delete(`/api/salon/${testSalonId}`);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /salon/:salon_id/average-rating', () => {
    it('should get average rating', async () => {
      (mockedService.prototype as any).getAverageRatingForSalon.mockResolvedValueOnce(4.5);
      const res = await request(app).get(`/api/salon/${testSalonId}/average-rating`);
      expect(res.status).toBe(200);
      expect(res.body.average).toBe(4.5);
    });
    it('should return 400 on error', async () => {
      (mockedService.prototype as any).getAverageRatingForSalon.mockRejectedValueOnce(
        new Error('fail'),
      );
      const res = await request(app).get(`/api/salon/${testSalonId}/average-rating`);
      expect(res.status).toBe(400);
    });
  });
});
