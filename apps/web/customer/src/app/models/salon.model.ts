import { DayOfWeek } from '@beauty-saas/shared/models/day-of-week.enum';

export interface Salon {
  id: string;
  name: string;
  slug: string;
  description?: string;
  // Alias for logoUrl to maintain backward compatibility with imagePath
  imagePath?: string;
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
  galleryImages?: string[];
  timezone: string;
  isActive: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  ownerId: string;
  ownerName?: string;
  amenities?: string[];
  services?: SalonService[];
  staff?: SalonStaff[];
  workingHours?: SalonWorkingHours[];
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    [key: string]: string | undefined;
  };
  settings?: {
    bookingWindowDays: number;
    cancellationWindowHours: number;
    requiresDeposit: boolean;
    depositPercentage: number;
    allowOnlineBooking: boolean;
    allowWalkIns: boolean;
    notifyNewBookings: boolean;
    notifyCancellations: boolean;
    [key: string]: any;
  };
  // Rating and review information
  rating?: number;
  reviewCount?: number;

  // Detailed statistics
  stats?: {
    averageRating: number;
    reviewCount: number;
    appointmentCount: number;
    customerCount: number;
  };
  metadata?: Record<string, any>;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date;
}

export interface SalonService {
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price: number;
  category?: string;
  isActive: boolean;
  staffIds?: string[];
  imageUrl?: string;
  sortOrder: number;
  metadata?: Record<string, any>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SalonStaff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  position?: string;
  isActive: boolean;
  services?: string[]; // Service IDs
  workingHours?: StaffWorkingHours[];
  metadata?: Record<string, any>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SalonWorkingHours {
  day: DayOfWeek;
  isOpen: boolean;
  openTime?: string; // Format: 'HH:mm'
  closeTime?: string; // Format: 'HH:mm'
  is24Hours?: boolean;
  breakStart?: string; // Format: 'HH:mm'
  breakEnd?: string; // Format: 'HH:mm'
}

export interface StaffWorkingHours extends SalonWorkingHours {
  staffId: string;
}

export interface SalonReview {
  id: string;
  salonId: string;
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

export interface SalonGalleryImage {
  id: string;
  salonId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  isFeatured: boolean;
  sortOrder: number;
  metadata?: Record<string, any>;
  uploadedBy: string;
  uploadedAt: string | Date;
}

export interface SalonSearchResult {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  distance?: number; // in kilometers or miles
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  // Alias for logoUrl to maintain backward compatibility with imagePath
  imagePath?: string;
  coverImageUrl?: string;
  isOpenNow: boolean;
  nextOpeningTime?: string; // ISO date string
  // Rating and review information
  averageRating: number;
  rating?: number; // Alias for averageRating
  reviewCount: number;
  services?: Array<{
    id: string;
    name: string;
    duration: number;
    price: number;
  }>;
  staffCount: number;
  serviceCount: number;
  isVerified: boolean;
  isFeatured: boolean;
  amenities?: string[];
  metadata?: Record<string, any>;
}

export interface SalonListResponse {
  data: Salon[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

