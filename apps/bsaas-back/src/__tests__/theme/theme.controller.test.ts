import request from 'supertest';
import app from '../../app';
import { ThemeService } from '../../services/theme.service';
jest.mock('../../services/theme.service');
const mockedService = ThemeService as jest.MockedClass<typeof ThemeService>;
const testThemeId = 'test-theme';
describe('Theme Controller', () => {
  describe('GET /theme', () => {
    it('should return themes', async () => {
      mockedService.prototype.getThemes.mockResolvedValueOnce([
        {
          id: testThemeId,
          name: 'Dark',
          primary_color: '#000',
          secondary_color: '#111',
          accent_color: '#222',
        },
      ]);
      const res = await request(app).get('/api/theme');
      expect(res.status).toBe(200);
      expect(res.body[0].id).toBe(testThemeId);
    });
    it('should return 400 on error', async () => {
      mockedService.prototype.getThemes.mockRejectedValueOnce(new Error('fail'));
      const res = await request(app).get('/api/theme');
      expect(res.status).toBe(400);
    });
  });
  describe('GET /theme/:theme_id', () => {
    it('should get theme details', async () => {
      mockedService.prototype.getThemeById.mockResolvedValueOnce({
        id: testThemeId,
        name: 'Dark',
        primary_color: '#000',
        secondary_color: '#111',
        accent_color: '#222',
      });
      const res = await request(app).get(`/api/theme/${testThemeId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(testThemeId);
    });
    it('should return 404 if not found', async () => {
      mockedService.prototype.getThemeById.mockResolvedValueOnce(null);
      const res = await request(app).get(`/api/theme/${testThemeId}`);
      expect(res.status).toBe(404);
    });
    it('should return 400 on error', async () => {
      mockedService.prototype.getThemeById.mockRejectedValueOnce(new Error('fail'));
      const res = await request(app).get(`/api/theme/${testThemeId}`);
      expect(res.status).toBe(400);
    });
  });
});
