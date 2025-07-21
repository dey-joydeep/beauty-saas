import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type Review = {
  id: string;
  salonId: string;
  userId: string;
  bookingId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function mapReview(prismaReview: any): Review {
  return {
    id: prismaReview.id,
    salonId: prismaReview.salon_id,
    userId: prismaReview.user_id,
    bookingId: prismaReview.booking_id,
    rating: prismaReview.rating,
    comment: prismaReview.comment,
    createdAt: prismaReview.created_at,
    updatedAt: prismaReview.updated_at,
  };
}

export class ReviewService {
  async getReviews(filter: Record<string, any>): Promise<Review[]> {
    const reviews = await prisma.review.findMany({ where: filter });
    return reviews.map(mapReview);
  }

  async getReviewById(id: string): Promise<Review | null> {
    const review = await prisma.review.findUnique({ where: { id } });
    return review ? mapReview(review) : null;
  }

  async createReview(data: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review> {
    const review = await prisma.review.create({
      data: {
        user_id: data.userId,
        salon_id: data.salonId,
        booking_id: data.bookingId,
        rating: data.rating,
        comment: data.comment,
      },
    });
    return mapReview(review);
  }

  async updateReview(id: string, data: Partial<Omit<Review, 'id'>>): Promise<Review | null> {
    const updateData: any = {};
    if (data.userId !== undefined) updateData.user_id = data.userId;
    if (data.salonId !== undefined) updateData.salon_id = data.salonId;
    if (data.bookingId !== undefined) updateData.booking_id = data.bookingId;
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.comment !== undefined) updateData.comment = data.comment;
    const review = await prisma.review.update({ where: { id }, data: updateData });
    return mapReview(review);
  }

  async deleteReview(id: string): Promise<boolean> {
    await prisma.review.delete({ where: { id } });
    return true;
  }
}
