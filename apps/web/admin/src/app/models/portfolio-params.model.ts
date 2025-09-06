export interface PortfolioItemParams {
  id?: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  categories?: string[];
  tags?: string[];
  isFeatured?: boolean;
  order?: number;
  metadata?: Record<string, any>;
}

export interface CreatePortfolioParams extends Omit<PortfolioItemParams, 'id'> {
  salonId: string;
  createdBy: string;
}

export interface UpdatePortfolioParams extends Partial<PortfolioItemParams> {
  id: string;
  updatedBy: string;
}

export interface PortfolioQueryParams {
  salonId?: string;
  createdBy?: string;
  category?: string;
  tag?: string;
  isFeatured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PortfolioUploadResponse {
  success: boolean;
  imageUrl: string;
  thumbnailUrl?: string;
  message?: string;
}

export interface PortfolioBulkUploadParams {
  salonId: string;
  items: Array<{
    title: string;
    description?: string;
    imageUrl: string;
    thumbnailUrl?: string;
    categories?: string[];
    tags?: string[];
    isFeatured?: boolean;
    order?: number;
  }>;
  createdBy: string;
}

export interface PortfolioCategoryParams {
  id?: string;
  name: string;
  description?: string;
  slug?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface PortfolioTagParams {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}
