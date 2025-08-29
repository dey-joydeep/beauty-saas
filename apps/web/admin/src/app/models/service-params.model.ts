export interface ServiceParams {
  id?: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in minutes
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  imageUrl?: string;
  staffIds?: string[];
  addOns?: ServiceAddOnParams[];
  requiresStaffSelection?: boolean;
  bufferTimeBefore?: number; // in minutes
  bufferTimeAfter?: number; // in minutes
  metadata?: Record<string, any>;
}

export interface CreateServiceParams extends Omit<ServiceParams, 'id' | 'addOns'> {
  salonId: string;
  createdBy: string;
  addOns?: Omit<ServiceAddOnParams, 'id'>[];
}

export interface UpdateServiceParams extends Partial<Omit<ServiceParams, 'id' | 'addOns'>> {
  id: string;
  updatedBy: string;
  addOns?: (Omit<ServiceAddOnParams, 'id'> & { id?: string })[];
}

export interface ServiceQueryParams {
  salonId?: string;
  categoryId?: string;
  staffId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ServiceCategoryParams {
  id?: string;
  name: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  isActive?: boolean;
  order?: number;
  metadata?: Record<string, any>;
}

export interface ServiceAddOnParams {
  id?: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in minutes
  isActive?: boolean;
  order?: number;
  metadata?: Record<string, any>;
}

export interface ServiceAvailabilityParams {
  serviceId: string;
  staffId?: string;
  salonId: string;
  date: string; // ISO date string
  duration?: number; // in minutes
}

export interface ServiceDurationParams {
  serviceId: string;
  duration: number; // in minutes
  updatedBy: string;
}

export interface ServicePriceParams {
  serviceId: string;
  price: number;
  updatedBy: string;
}

export interface ServiceStaffAssignmentParams {
  serviceId: string;
  staffIds: string[];
  updatedBy: string;
}

export interface ServiceImageParams {
  serviceId: string;
  imageUrl: string;
  isPrimary: boolean;
  order?: number;
  metadata?: Record<string, any>;
}
