// moved from routes/user.routes.ts
import { Router } from 'express';
import {
  getUserStats,
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from './user.controller';
import { authenticateJWT } from '../../middleware/auth';

const router = Router();

// User registration
router.post('/register', registerUser);

// User login (cookie-based JWT)
router.post('/login', loginUser);

// Current user info
router.get('/me', authenticateJWT, getCurrentUser);

// User logout
router.post('/logout', logoutUser);

// Analytics: Registered vs. active users
router.get('/stats', authenticateJWT, getUserStats);

export default router;
