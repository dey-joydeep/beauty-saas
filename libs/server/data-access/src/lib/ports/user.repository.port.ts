import { User } from '@prisma/client';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface IUserRepository {
  findById(id: string): Promise<(User & { roles: { role: { name: string } }[] }) | null>;
  findByEmail(email: string): Promise<(User & { roles: { role: { name: string } }[] }) | null>;
  create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
}
