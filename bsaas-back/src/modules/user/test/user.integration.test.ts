// moved from __tests__/user/user.integration.test.ts
import { UserService } from '../../user/user.service';
describe('UserService Integration', () => {
  const userService = new UserService();
  it('should create and fetch a user', async () => {
    const user = await userService.createUser({
      data: {
        name: 'Integration User',
        email: 'integration@example.com',
        passwordHash: 'hash',
        tenantId: 't1',
      },
    });
    const fetched = await userService.getUserById({ id: user.id });
    expect(fetched).toMatchObject({ id: user.id, email: 'integration@example.com' });
  });
  // Add more integration tests as needed
});
