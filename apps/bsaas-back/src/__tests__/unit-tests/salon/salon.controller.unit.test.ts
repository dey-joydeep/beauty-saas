// Placeholder for salon controller unit tests (mocked service)

import request from 'supertest';
import app from '../../../app';
import { SalonService } from '../../../services/salon.service';
jest.mock('../../../services/salon.service');
const mockedService = SalonService as jest.MockedClass<typeof SalonService>;
const testSalonId = 'test-salon';

describe('Salon Controller Unit', () => {
  describe('GET /salon/search', () => {
    it('should return salons', async () => {
      (mockedService.prototype.searchSalons as jest.Mock).mockResolvedValueOnce([
        {
          id: testSalonId,
          name: 'Salon A',
          address: '123 St',
          city: 'City',
          zipCode: '12345',
          latitude: 0,
          longitude: 0,
        },
      ]);
      const res = await request(app).get('/api/salon/search?q=Salon');
      expect(res.status).toBe(200);
      expect(res.body[0].id).toBe(testSalonId);
    });
    it('should return 400 on error', async () => {
      (mockedService.prototype.searchSalons as jest.Mock).mockRejectedValueOnce(new Error('fail'));
      const res = await request(app).get('/api/salon/search?q=Salon');
      expect(res.status).toBe(400);
    });
  });
  describe('GET /salon/:salon_id', () => {
    it('should get salon details', async () => {
      (mockedService.prototype.getSalonById as jest.Mock).mockResolvedValueOnce({
        id: testSalonId,
        name: 'Salon A',
        address: '123 St',
        city: 'City',
        zipCode: '12345',
        latitude: 0,
        longitude: 0,
      });
      const res = await request(app).get(`/api/salon/${testSalonId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(testSalonId);
    });
    it('should return 404 if not found', async () => {
      (mockedService.prototype.getSalonById as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(app).get(`/api/salon/${testSalonId}`);
      expect(res.status).toBe(404);
    });
    it('should return 400 on error', async () => {
      (mockedService.prototype.getSalonById as jest.Mock).mockRejectedValueOnce(new Error('fail'));
      const res = await request(app).get(`/api/salon/${testSalonId}`);
      expect(res.status).toBe(400);
    });
  });
  describe('GET /salon/top', () => {
    it('should get top salons', async () => {
      (mockedService.prototype.getTopSalons as jest.Mock).mockResolvedValueOnce([
        {
          id: testSalonId,
          name: 'Salon A',
          address: '123 St',
          city: 'City',
          zipCode: '12345',
          latitude: 0,
          longitude: 0,
        },
      ]);
      const res = await request(app).get('/api/salon/top');
      expect(res.status).toBe(200);
      expect(res.body[0].id).toBe(testSalonId);
    });
    it('should return 400 on error', async () => {
      (mockedService.prototype.getTopSalons as jest.Mock).mockRejectedValueOnce(new Error('fail'));
      const res = await request(app).get('/api/salon/top');
      expect(res.status).toBe(400);
    });
  });
});
