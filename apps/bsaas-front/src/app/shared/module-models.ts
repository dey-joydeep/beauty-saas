export interface ModuleModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface FeatureListResponse {
  items: ModuleModel[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ModulePagination {
  page: number;
  pageSize: number;
  sort?: string;
  filter?: string;
}

export interface ModuleErrorResponse {
  message: string;
  code?: string;
  details?: any;
}
