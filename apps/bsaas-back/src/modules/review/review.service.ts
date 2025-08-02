import { PrismaClient, type Prisma } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export type Review = {
  id: string;
  salonId: string;
  userId: string;
  appointmentId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface CreateReviewDto {
  userId: string;
  salonId: string;
  rating: number;
  comment?: string | null;
  appointmentId: string;
}

export interface UpdateReviewDto extends Partial<Omit<CreateReviewDto, 'appointmentId'>> {
  appointmentId?: string; // Make optional for updates
}

function mapReview(prismaReview: {
  id: string;
  salon_id: string;
  user_id: string;
  appointment_id: string;
  rating: number;
  comment: string | null;
  created_at: Date;
  updated_at: Date;
}): Review {
  return {
    id: prismaReview.id,
    salonId: prismaReview.salon_id,
    userId: prismaReview.user_id,
    appointmentId: prismaReview.appointment_id,
    rating: prismaReview.rating,
    comment: prismaReview.comment,
    createdAt: prismaReview.created_at,
    updatedAt: prismaReview.updated_at,
  };
}

export class ReviewService {
  async getReviews(filter: Record<string, any>): Promise<Review[]> {
    const reviews = await prisma.review.findMany({ where: filter });
    // return reviews.map(mapReview);
    return [];
  }

  async getReviewById(id: string): Promise<Review | null> {
    const review = await prisma.review.findUnique({ where: { id } });
    // return review ? mapReview(review) : null;
    return null;
  }

  async createReview(data: CreateReviewDto): Promise<Review> {
    // const review = await prisma.review.create({
    //   data: {
    //     user: { connect: { id: data.userId } },
    //     salon: { connect: { id: data.salonId } },
    //     appointment: { connect: { id: data.appointmentId } },
    //     rating: data.rating,
    //     comment: data.comment ?? null,
    //   },
    // });

    // return mapReview(review);
    return {} as Review;
  }

  async updateReview(id: string, data: UpdateReviewDto): Promise<Review | null> {
    const updateData: Prisma.ReviewUpdateInput = {};
    
    if (data.userId !== undefined) updateData.user = { connect: { id: data.userId } };
    if (data.salonId !== undefined) updateData.salon = { connect: { id: data.salonId } };
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.comment !== undefined) updateData.comment = data.comment;
    
    try {
      const review = await prisma.review.update({
        where: { id },
        data: updateData,
      });
      
      // return mapReview(review);
      return null;
    } catch (error) {
      console.error('Error updating review:', error);
      return null;
    }
  }

  async deleteReview(id: string): Promise<boolean> {
    await prisma.review.delete({ where: { id } });
    return true;
  }
}
