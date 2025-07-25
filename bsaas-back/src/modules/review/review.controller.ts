import { Request, Response } from 'express';
import { ReviewService } from './review.service';
import type { NextFunction } from 'express';
import { AppointmentService } from '../appointment/appointment.service';
import { authenticateJWT } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { createReviewSchema, updateReviewSchema } from './review.validation';
import { PrismaService } from '../../prisma/prisma.service';

// Initialize services
const prismaService = new PrismaService();

// Configure logging for development (commented out to avoid TypeScript errors)
// prismaService.$on('query' as never, (e: any) => {
//   console.log('Query: ' + e.query);
//   console.log('Params: ' + e.params);
//   console.log('Duration: ' + e.duration + 'ms');
// });

// Initialize services with their required dependencies
const reviewService = new ReviewService(); // ReviewService doesn't take any constructor arguments

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
      // TODO: Implement review listing with proper filtering
      // For now, return an empty array as a placeholder
      res.json([]);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      res.status(500).json({ 
        error: err.message || 'Failed to fetch reviews' 
      });
    }
  },
);

export const createReview = [
  authenticateJWT,
  requireRole(['customer']),
  validate(createReviewSchema),
  async (req: Request, res: Response) => {
    try {
      const { userId, salonId, rating, comment, appointmentId } = req.body;
      
      // Verify the appointment exists and is completed
      const appointment = await prismaService.appointment.findFirst({
        where: { 
          id: appointmentId,
          status: 'completed',
          userId: userId,
          salonId: salonId
        },
        include: {
          user: true,
          salon: true,
          // Include service details if needed
          service: true
        }
      });

      if (!appointment) {
        return res.status(403).json({ 
          error: 'No completed appointment found for this user and salon' 
        });
      }

      // Check if review already exists for this appointment
      const existingReview = await prismaService.review.findFirst({
        where: { 
          appointmentId: appointmentId,
          userId: userId
        }
      });

      if (existingReview) {
        return res.status(400).json({
          error: 'A review already exists for this appointment'
        });
      }

      const review = await reviewService.createReview({
        userId,
        salonId,
        rating,
        comment: comment ?? null,
        appointmentId,
      });
      
      res.status(201).json(review);
    } catch (err: any) {
      console.error('Error creating review:', err);
      res.status(400).json({ 
        error: err.message || 'Failed to create review' 
      });
    }
  },
];

export const updateReview = [
  authenticateJWT,
  requireRole(['admin', 'owner', 'staff', 'customer']),
  validate(updateReviewSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      
      // Get the review to check ownership
      const review = await prismaService.review.findUnique({
        where: { id }
      });

      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      // Check if the current user is the owner of the review
      // or has admin/owner/staff role
      const isOwner = review.user_id === (req as any).user?.id;
      const isAdmin = ['admin', 'owner', 'staff'].includes((req as any).user?.role);
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ 
          error: 'You do not have permission to update this review' 
        });
      }

      const updatedReview = await reviewService.updateReview(id, { 
        rating, 
        comment: comment ?? null 
      });
      
      if (!updatedReview) {
        return res.status(404).json({ error: 'Failed to update review' });
      }
      
      res.json(updatedReview);
    } catch (err: any) {
      console.error('Error updating review:', err);
      res.status(400).json({ 
        error: err.message || 'Failed to update review' 
      });
    }
  },
];

export const deleteReview = withAuthAndRole(
  ['admin', 'owner', 'customer'],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      
      // Get the review to check ownership
      const review = await prismaService.review.findUnique({
        where: { id }
      });

      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      // Check if the current user is the owner of the review
      // or has admin/owner role
      const isOwner = review.user_id === userId;
      const isAdmin = ['admin', 'owner'].includes(userRole);
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ 
          error: 'You do not have permission to delete this review' 
        });
      }

      const deleted = await reviewService.deleteReview(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Failed to delete review' });
      }
      
      res.status(204).end();
    } catch (err: any) {
      console.error('Error deleting review:', err);
      res.status(400).json({ 
        error: err.message || 'Failed to delete review' 
      });
    }
  },
);

export const getReviewById = withAuthAndRole(
  ['admin', 'owner', 'staff', 'customer'],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const review = await reviewService.getReviewById(id);
      
      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }
      
      res.json(review);
    } catch (err: any) {
      console.error('Error fetching review:', err);
      res.status(400).json({ 
        error: err.message || 'Failed to fetch review' 
      });
    }
  },
);
