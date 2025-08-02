// moved from __tests__/social/social.test.ts
import { SocialService } from '../social.service';
describe('SocialService', () => {
  const socialService = new SocialService();
  it('should create a social link', async () => {
    const social = await socialService.createSocial({
      userId: 'u1',
      platform: 'twitter',
      handle: '@handle',
      url: 'https://twitter.com/handle',
    });
    expect(social).toHaveProperty('id');
  });
  // Add more tests as needed
});
