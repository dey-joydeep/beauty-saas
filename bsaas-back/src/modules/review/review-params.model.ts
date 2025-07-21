// moved from models/review-params.model.ts
// ReviewParams for review module

export interface GetReviewsParams {
  filter: Record<string, any>;
}

export interface CreateReviewParams {
  data: {
    userId: string;
    salonId: string;
    rating: number;
    comment?: string;
  };
}

export interface UpdateReviewParams {
  id: string;
  data: Partial<Omit<CreateReviewParams['data'], 'id'>>;
}

export interface DeleteReviewParams {
  id: string;
}

export interface GetReviewByIdParams {
  id: string;
}
