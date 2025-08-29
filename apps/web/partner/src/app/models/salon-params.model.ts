import { DayOfWeek } from '@beauty-saas/shared/models/day-of-week.enum';

export interface CreateSalonParams {
  name: string;
  slug?: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  timezone: string;
  isActive?: boolean;
  isVerified?: boolean;
  ownerId: string;
  amenities?: string[];
  services?: string[];
  staffIds?: string[];
  workingHours?: {
    day: DayOfWeek;
    isOpen: boolean;
    openTime?: string; // Format: 'HH:mm'
    closeTime?: string; // Format: 'HH:mm'
    is24Hours?: boolean;
  }[];
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  settings?: {
    bookingWindowDays?: number;
    cancellationWindowHours?: number;
    requiresDeposit?: boolean;
    depositPercentage?: number;
    allowOnlineBooking?: boolean;
    allowWalkIns?: boolean;
    notifyNewBookings?: boolean;
    notifyCancellations?: boolean;
  };
  metadata?: Record<string, any>;
}

export interface UpdateSalonParams extends Partial<Omit<CreateSalonParams, 'ownerId' | 'slug'>> {
  id: string;
  updatedBy: string;
}

export interface SalonQueryParams {
  search?: string;
  ownerId?: string;
  city?: string;
  state?: string;
  country?: string;
  serviceId?: string;
  staffId?: string;
  isActive?: boolean;
  isVerified?: boolean;
  hasOnlineBooking?: boolean;
  minRating?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeServices?: boolean;
  includeStaff?: boolean;
  includeReviews?: boolean;
  includeWorkingHours?: boolean;
}

export interface SalonStats {
  totalAppointments: number;
  activeStaff: number;
  totalServices: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  lastUpdated: string | Date;
}

export interface SalonVerificationParams {
  salonId: string;
  verified: boolean;
  verifiedBy: string;
  notes?: string;
}

export interface SalonLocationParams {
  salonId: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  updatedBy: string;
}

export interface SalonImageUploadParams {
  salonId: string;
  type: 'logo' | 'cover' | 'gallery';
  file: File;
  isPrimary?: boolean;
  caption?: string;
  uploadedBy: string;
}

export interface SalonStatusParams {
  salonId: string;
  isActive: boolean;
  updatedBy: string;
  reason?: string;
}
