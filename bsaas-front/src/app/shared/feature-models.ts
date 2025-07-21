export interface FeatureModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface FeatureListResponse {
  items: FeatureModel[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FeaturePagination {
  page: number;
  pageSize: number;
  sort?: string;
  filter?: string;
}

export interface FeatureErrorResponse {
  message: string;
  code?: string;
  details?: any;
}
