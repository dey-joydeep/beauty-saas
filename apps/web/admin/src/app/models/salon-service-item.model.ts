export interface SalonServiceItem {
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price: number;
  originalPrice?: number;
  isOnSale: boolean;
  salePrice?: number;
  saleStartDate?: string | Date;
  saleEndDate?: string | Date;
  category?: string;
  subcategory?: string;
  isPopular: boolean;
  isFeatured: boolean;
  isActive: boolean;
  requiresConsultation: boolean;
  staffIds: string[];
  imageUrl?: string;
  galleryImages?: string[];
  sortOrder: number;
  metadata?: Record<string, any>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  parentId?: string;
  metadata?: Record<string, any>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ServiceAddOn {
  id: string;
  serviceId: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in minutes
  isActive: boolean;
  sortOrder: number;
  metadata?: Record<string, any>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ServicePackage {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  isOnSale: boolean;
  salePrice?: number;
  saleStartDate?: string | Date;
  saleEndDate?: string | Date;
  services: Array<{
    serviceId: string;
    name: string;
    price: number;
    duration: number;
    sortOrder: number;
  }>;
  totalDuration: number; // in minutes
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  metadata?: Record<string, any>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ServiceAvailability {
  serviceId: string;
  serviceName: string;
  duration: number;
  price: number;
  availableSlots: Array<{
    startTime: string | Date;
    endTime: string | Date;
    staffId: string;
    staffName: string;
  }>;
}

export interface ServiceReview {
  id: string;
  serviceId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number; // 1-5
  comment?: string;
  isAnonymous: boolean;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string | Date;
  metadata?: Record<string, any>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ServiceListResponse {
  data: SalonServiceItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ServiceSearchParams {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  durationMin?: number;
  durationMax?: number;
  staffId?: string;
  isOnSale?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  sortBy?: 'name' | 'price' | 'duration' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
