// moved from __tests__/user/user.edgecase.test.ts
import { UserService } from '../../user/user.service';
describe('User edge case tests', () => {
  const userService = new UserService();
  it('should not allow duplicate emails', async () => {
    const user1 = await userService.createUser({
      data: { name: 'User1', email: 'test@example.com', passwordHash: 'hash', tenantId: 't1' },
    });
    await expect(
      userService.createUser({
        data: { name: 'User2', email: 'test@example.com', passwordHash: 'hash', tenantId: 't1' },
      }),
    ).rejects.toThrow();
  });
  // Add more edge case tests as needed
});
