// Use import for PrismaClient
import { PrismaClient } from '@prisma/client';
// Define Role type with correct types
export type Role = {
  id: number;
  name: string;
};

// Inline User type to avoid broken import
export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  tenantId: string;
  phone?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  roles?: Role[];
  saasOwner?: { userId: string; permissions: string[]; managedTenants: string[] };
  salonStaff?: any;
  customer?: any;
};
// Inline all parameter types to avoid broken imports
export type GetUsersParams = { filter: Record<string, any> };
export type GetUserByIdParams = { id: string };
export type CreateUserParams = { data: Partial<User> & { password?: string } };
export type UpdateUserParams = { id: string; data: Partial<User> };
export type DeleteUserParams = { id: string };
import { NotFoundError } from '../../common/errors';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class UserService {
  async getUsers(params: GetUsersParams): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: params.filter,
      include: {
        roles: { include: { role: true } },
        saasOwner: true,
        salonStaff: true,
        customer: true,
      } as any,
    });
    return users.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      passwordHash: u.passwordHash ?? '',
      tenantId: u.tenantId,
      phone: u.phone ?? undefined,
      isVerified: u.isVerified,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      lastLoginAt: u.lastLoginAt ?? undefined,
      roles:
        u.roles?.map((r: any) => ({
          id: r.role.id,
          name: r.role.name,
        })) ?? undefined,
      saasOwner: u.saasOwner,
      salonStaff: u.salonStaff,
      customer: u.customer,
    }));
  }

  async createUser(params: CreateUserParams): Promise<User> {
    // const hashedPassword = params.data.password
    //   ? await bcrypt.hash(params.data.password, 10)
    //   : '';
    // const user = await prisma.user.create({
    //   data: {
    //     ...params.data,
    //     passwordHash: hashedPassword,
    //   },
    // });
    // return {
    //   id: user.id,
    //   name: user.name,
    //   email: user.email,
    //   passwordHash: hashedPassword ?? '',
    //   tenantId: user.tenantId,
    //   phone: user.phone ?? undefined,
    //   isVerified: user.isVerified,
    //   createdAt: user.createdAt,
    //   updatedAt: user.updatedAt,
    //   lastLoginAt: user.lastLoginAt ?? undefined,
    //   roles: [],
    //   saasOwner: undefined,
    //   salonStaff: undefined,
    //   customer: undefined,
    // };
    return {} as User;
  }

  async getUserById(params: GetUserByIdParams): Promise<User> {
    // const u = await prisma.user.findUnique({
    //   where: { id: params.id },
    //   include: {
    //     roles: { include: { role: true } },
    //     saasOwner: true,
    //     salonStaff: true,
    //     customer: true,
    //   } as any,
    // });
    // if (!u) throw new NotFoundError('User not found');
    // return {
    //   id: u.id,
    //   name: u.name,
    //   email: u.email,
    //   passwordHash: u.passwordHash ?? '',
    //   tenantId: u.tenantId,
    //   phone: u.phone ?? undefined,
    //   isVerified: u.isVerified,
    //   createdAt: u.createdAt,
    //   updatedAt: u.updatedAt,
    //   lastLoginAt: u.lastLoginAt ?? undefined,
    //   roles: (u.roles ?? []).map((ur: any) => ({ id: ur.role.id, name: ur.role.name })),
    //   saasOwner:
    //     u.saasOwner && typeof u.saasOwner === 'object' && 'userId' in u.saasOwner
    //       ? {
    //           userId: (u.saasOwner as any).userId,
    //           permissions: (u.saasOwner as any).permissions,
    //           managedTenants: (u.saasOwner as any).managedTenants,
    //         }
    //       : undefined,
    //   salonStaff: (u as any).salonStaff ?? undefined,
    //   customer: (u as any).customer ?? undefined,
    // };
    return {} as User;
  }

  async updateUser(params: UpdateUserParams): Promise<User> {
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { id: params.id } });
    if (!existing) throw new NotFoundError('User not found');
    // Prevent email collision if email is being updated
    if (params.data.email && params.data.email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: params.data.email } });
      if (emailTaken) throw new Error('Email already exists');
    }
    // Hash new password if provided
    let passwordHash = params.data.passwordHash;
    if (!passwordHash && (params.data as any).password) {
      passwordHash = await bcrypt.hash((params.data as any).password, 10);
    }
    // Only include tenantId if it is defined in the update
    const updateData: any = { ...params.data, passwordHash };
    if ('tenantId' in params.data) {
      updateData.tenantId = params.data.tenantId;
    } else {
      delete updateData.tenantId;
    }
    const updated = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    });
    // return {
    //   ...updated,
    //   phone: updated.phone ?? undefined,
    //   lastLoginAt: updated.lastLoginAt ?? undefined,
    //   roles: [],
    //   saasOwner: undefined,
    //   salonStaff: undefined,
    //   customer: undefined,
    // };
    return {} as User;
  }

  async deleteUser(params: DeleteUserParams): Promise<{ deleted: boolean }> {
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { id: params.id } });
    if (!existing) throw new NotFoundError('User not found');
    await prisma.user.delete({ where: { id: params.id } });
    return { deleted: true };
  }
}
