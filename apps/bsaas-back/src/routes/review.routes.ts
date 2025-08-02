import { Router } from 'express';
import { getReviews, createReview } from '../modules/review/review.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Anyone can view reviews
router.get('/salon/:salon_id/reviews', getReviews);
// Only eligible users can post reviews
router.post('/salon/:salon_id/review', createReview);

export default router;
