import { Request, Response } from 'express';
import { ReviewService } from './review.service';
import type {
  GetReviewsParams,
  CreateReviewParams,
  UpdateReviewParams,
  DeleteReviewParams,
  GetReviewByIdParams,
} from './review-params.model';
import { authenticateJWT } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { createReviewSchema, updateReviewSchema } from './review.validation';
import type { NextFunction } from 'express';
import { BookingService } from '../booking/booking.service';

const reviewService = new ReviewService();
const bookingService = new BookingService();

function withAuthAndRole(
  roles: string[],
  handler: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) {
  return [authenticateJWT, requireRole(roles), handler];
}

export const getReviews = withAuthAndRole(
  ['admin', 'owner', 'staff', 'customer'],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params: GetReviewsParams = { filter: req.query };
      res.json([]); // Not implemented in service
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
);

export const createReview = [
  authenticateJWT,
  requireRole(['customer']),
  validate(createReviewSchema),
  async (req: Request, res: Response) => {
    try {
      const { userId, salonId, rating, comment, bookingId } = req.body;
      // Eligibility check: must have completed booking for this salon
      const eligible = await bookingService.isUserEligibleToReview(userId, salonId);
      if (!eligible) {
        return res.status(403).json({ error: 'You are not eligible to review this salon.' });
      }
      const review = await reviewService.createReview({
        userId,
        salonId,
        bookingId,
        rating,
        comment: comment ?? null,
      });
      res.status(201).json(review);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
];

export const updateReview = [
  authenticateJWT,
  requireRole(['admin', 'owner', 'staff']),
  validate(updateReviewSchema),
  async (req: Request, res: Response) => {
    try {
      const params: UpdateReviewParams = { id: req.params.id, data: req.body };
      const review = await reviewService.updateReview(params.id, params.data);
      res.json(review);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
];

export const deleteReview = withAuthAndRole(
  ['admin', 'owner'],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params: DeleteReviewParams = { id: req.params.id };
      await reviewService.deleteReview(params.id);
      res.status(204).end();
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
);

export const getReviewById = withAuthAndRole(
  ['admin', 'owner', 'staff', 'customer'],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params: GetReviewByIdParams = { id: req.params.id };
      const review = await reviewService.getReviewById(params.id);
      if (!review) return res.status(404).json({ error: 'Review not found' });
      res.json(review);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
);
