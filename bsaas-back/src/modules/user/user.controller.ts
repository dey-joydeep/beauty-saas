import { Request, Response } from 'express';
import { UserService } from './user.service';
import { AuthRequest, authenticateJWT } from '../../middleware/auth';
import jwt from 'jsonwebtoken';
import { validate } from '../../middleware/validate';
import { registerUserSchema, updateUserSchema } from './user.validation';
import { User } from './user.model';
import bcrypt from 'bcryptjs';
const userService = new UserService();

export const getUserStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tenant_id } = req.query;
    const tenantId = String(tenant_id);
    // RBAC: Only admin, and only for their own tenant
    const user = req.user;
    if (
      !user ||
      !user.roles ||
      !user.roles.some((r: any) => r.name === 'admin') ||
      user.tenantId !== tenantId
    ) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const stats = await userService.getUserStats(tenantId);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get all users
export const getUsers = [
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const users = await userService.getUsers({});
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
];

// POST /user/register
export const registerUser = [
  validate(registerUserSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        name,
        email,
        password,
        roles,
        tenantId,
        phone,
        isVerified,
        saasOwner,
        salonStaff,
        customer,
      } = req.body;
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      // Use UserService to create user
      const user = await userService.createUser({
        data: {
          name,
          email,
          passwordHash,
          tenantId,
          phone,
          isVerified,
          roles,
          saasOwner,
          salonStaff,
          customer,
        },
      });
      // Attach roles array to JWT payload
      const token = jwt.sign(
        { id: user.id, email: user.email, roles: user.roles },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' },
      );
      // Only expose safe user fields
      const userSafe: Partial<User> = {
        id: user.id,
        name: user.name,
        email: user.email,
        tenantId: user.tenantId,
        roles: user.roles,
        isVerified: user.isVerified,
        saasOwner: user.saasOwner,
        salonStaff: user.salonStaff,
        customer: user.customer,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
        phone: user.phone,
      };
      res.status(201).json({ user: userSafe, token });
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(409).json({ error: 'Email already exists.' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },
];

// PATCH /user/:id
export const updateUser = [
  validate(updateUserSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await userService.updateUser({
        id,
        data: req.body,
      });
      // Only expose safe user fields
      const userSafe: Partial<User> = {
        id: result.id,
        name: result.name,
        email: result.email,
        tenantId: result.tenantId,
        roles: result.roles,
        isVerified: result.isVerified,
        saasOwner: result.saasOwner,
        salonStaff: result.salonStaff,
        customer: result.customer,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        lastLoginAt: result.lastLoginAt,
        phone: result.phone,
      };
      res.status(200).json({ user: userSafe });
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(409).json({ error: 'Email already exists.' });
      } else if (error.message === 'User not found') {
        res.status(404).json({ error: 'User not found.' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },
];

// DELETE /user/:id
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await userService.deleteUser({ id });
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'User not found') {
      res.status(404).json({ error: 'User not found.' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// POST /user/login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  // ...implementation
};

// GET /user/me
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await userService.getUserById({ id: req.user.id });
    // Only expose safe user fields
    const userSafe: Partial<User> = {
      id: user.id,
      name: user.name,
      email: user.email,
      tenantId: user.tenantId,
      roles: user.roles,
      isVerified: user.isVerified,
      saasOwner: user.saasOwner,
      salonStaff: user.salonStaff,
      customer: user.customer,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      phone: user.phone,
    };
    res.status(200).json({ user: userSafe });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// POST /user/logout
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  // ...implementation
};
