import { ThemeService } from '../../services/theme.service';

describe('ThemeService Edge Cases', () => {
  const service = new ThemeService();

  it('should throw error for invalid color codes', async () => {
    await expect(
      service.updateTheme('tenant1', {
        primary_color: 'blue',
        secondary_color: '#fff',
        accent_color: '#gggggg',
      }),
    ).rejects.toThrow();
  });

  it('should throw error for missing colors', async () => {
    await expect(
      service.updateTheme('tenant1', { primary_color: '', secondary_color: '', accent_color: '' }),
    ).rejects.toThrow();
  });
});
