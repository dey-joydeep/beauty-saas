// moved from __tests__/user/user.service.test.ts
import { UserService } from '../../user/user.service';
describe('UserService', () => {
  const userService = new UserService();
  it('should create a user', async () => {
    const user = await userService.createUser({
      data: { name: 'Test User', email: 'test2@example.com', passwordHash: 'hash', tenantId: 't1' },
    });
    expect(user).toHaveProperty('id');
  });
  // Add more service tests as needed
});
