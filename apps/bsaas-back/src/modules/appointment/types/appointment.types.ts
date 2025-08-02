import { Appointment as PrismaAppointment, User, Prisma, TenantService, Salon, SalonTenantStaff } from '@prisma/client';

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  BOOKED = 'booked'
}

export const APPOINTMENT_STATUS_VALUES = Object.values(AppointmentStatus) as AppointmentStatus[];
export const VALID_APPOINTMENT_STATUSES = APPOINTMENT_STATUS_VALUES;

// Reusable include fragments
export const CUSTOMER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  isActive: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
  isVerified: true,
  avatarUrl: true
} as const;

export const TENANT_SERVICE_SELECT = {
  id: true,
  name: true,
  description: true,
  price: true,
  duration: true,
  tenantId: true,
  salonId: true,
  serviceCategoryId: true,
  isActive: true,
  taxRate: true,
  isTaxable: true,
  sku: true,
  barcode: true,
  quantityInStock: true,
  reorderPoint: true,
  metadata: true,
  createdAt: true,
  updatedAt: true
} as const;

export const TENANT_PRODUCT_SELECT = {
  id: true,
  name: true,
  description: true,
  price: true,
  tenantId: true,
  isActive: true,
  taxRate: true,
  isTaxable: true,
  sku: true,
  barcode: true,
  quantityInStock: true,
  reorderPoint: true,
  metadata: true,
  createdAt: true,
  updatedAt: true
} as const;

export const SALON_SELECT = {
  id: true,
  name: true,
  description: true,
  address: true,
  city: true,
  state: true,
  postalCode: true,
  country: true,
  phone: true,
  email: true,
  website: true,
  logo: true,
  banner: true,
  imageUrl: true,
  isActive: true,
  isVerified: true,
  isDeleted: true,
  deletedAt: true,
  tenantId: true,
  ownerId: true,
  timezone: true,
  createdAt: true,
  updatedAt: true
} as const;

export const REVIEW_SELECT = {
  id: true,
  rating: true,
  comment: true,
  isAnonymous: true,
  isApproved: true,
  response: true,
  responseDate: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
  userId: true,
  salonId: true,
  appointmentId: true,
  staffId: true,
  adminComment: true
} as const;

export const PRODUCT_SALE_SELECT = {
  id: true,
  appointmentId: true,
  productId: true,
  tenantProductId: true,
  tenantId: true,
  customerId: true,
  quantity: true,
  pricePerUnit: true,
  unitPrice: true,
  totalPrice: true,
  discount: true,
  taxRate: true,
  taxAmount: true,
  isRefunded: true,
  refundedAt: true,
  refundReason: true,
  notes: true,
  metadata: true,
  createdAt: true,
  updatedAt: true
} as const;

// Base types for related entities
type BaseProductSale = {
  id: string;
  appointmentId: string;
  tenantProductId: string | null;
  quantity: number;
  pricePerUnit: number | Prisma.Decimal;
  discount: number | Prisma.Decimal;
  taxRate: number | Prisma.Decimal;
  taxAmount: number | Prisma.Decimal;
  totalPrice: number | Prisma.Decimal;
  notes: string | null;
  isRefunded: boolean;
  refundedAt: Date | null;
  refundReason: string | null;
  tenantId: string;
  customerId: string | null;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
  product?: TenantProductWithDetails | null;
};

type BaseReview = {
  id: string;
  appointmentId: string;
  customerId: string;
  staffId: string | null;
  rating: number;
  comment: string | null;
  isAnonymous: boolean;
  isApproved: boolean;
  response: string | null;
  responseDate: Date | null;
  tenantId: string;
  salonId: string | null;
  adminComment: string | null;
  createdAt: Date;
  updatedAt: Date;
  customer?: UserWithMinimalInfo | null;
  staff?: StaffWithUser | null;
};

type BaseAppointmentService = {
  id: string;
  appointmentId: string;
  tenantServiceId: string | null;
  staffId: string | null;
  price: number | Prisma.Decimal;
  duration: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  tenantService: TenantServiceWithDetails | null;
  staff?: StaffWithUser | null;
};

type TenantServiceWithDetails = Prisma.TenantServiceGetPayload<{ 
  select: typeof TENANT_SERVICE_SELECT 
}> & {
  staff?: StaffWithUser[];
  category?: {
    id: string;
    name: string;
  } | null;
};

type TenantProductWithDetails = Prisma.TenantProductGetPayload<{ 
  select: typeof TENANT_PRODUCT_SELECT 
}>;

export type RawAppointment = PrismaAppointment & {
  customer?: UserWithMinimalInfo | null;
  staff?: StaffWithUser | null;
  services: BaseAppointmentService[];
  salons: Array<Prisma.SalonGetPayload<{ select: typeof SALON_SELECT }>>;
  reviews: BaseReview[];
  productSales: BaseProductSale[];
};

export interface ServiceWithDetails extends TenantService {
  staff?: StaffWithUser[];
  category?: {
    id: string;
    name: string;
  } | null;
}

export interface UserWithMinimalInfo {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  isActive: boolean;
  tenantId: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  isVerified: boolean;
  avatarUrl?: string | null;
  passwordHash?: string;
}

export interface SalonWithMinimalInfo extends Pick<Salon, 
  'id' | 'name' | 'description' | 'isActive' | 'tenantId' | 'createdAt' | 'updatedAt' | 'imageUrl' | 'ownerId'
> {
  address?: string | null;
  city?: string | null;
  zipCode?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logo?: string | null;
  banner?: string | null;
  isVerified?: boolean;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  services?: ServiceWithDetails[];
  salonStaff?: StaffWithUser[];
}

export interface StaffWithUser {
  id: string;
  userId: string;
  salonId: string;
  position: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  hireDate?: Date | null;
  terminationDate?: Date | null;
  user: UserWithMinimalInfo | null;
  salon?: SalonWithMinimalInfo;
  services?: ServiceWithDetails[];
}

export interface AppointmentServiceWithDetails {
  id: string;
  appointmentId: string;
  tenantServiceId: string | null;
  staffId: string | null;
  price: number;
  duration: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  tenantService: {
    id: string;
    name: string;
    description: string | null;
    price: number | Prisma.Decimal;
    duration: number;
    tenantId: string;
    salonId: string | null;
    serviceCategoryId: string | null;
    isActive: boolean;
    metadata: Prisma.JsonValue;
    taxRate: Prisma.Decimal | null;
    isTaxable: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  staff: StaffWithUser | null;
}

export interface AppointmentWithDetails extends PrismaAppointment {
  customer?: UserWithMinimalInfo | null;
  staff?: StaffWithUser | null;
  services: AppointmentServiceWithDetails[];
  salons: SalonWithMinimalInfo[];
  reviews: any[];
  productSales: any[];
}

export interface AppointmentDto {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  customerId: string;
  customerName: string;
  customerEmail: string;
  staffId: string | null;
  staffName: string;
  serviceId: string;
  serviceName: string;
  duration: number;
  price: number;
  salonId: string;
  salonName: string;
  createdAt: string;
  updatedAt: string;
}



export interface CreateAppointmentDto {
  tenantId: string;
  customerId: string;
  staffId?: string;
  salonId: string;
  serviceIds: string[];
  startTime: string;
  endTime: string;
  notes?: string;
  status?: AppointmentStatus;
}

export interface UpdateAppointmentDto {
  id: string;
  staffId?: string;
  status?: AppointmentStatus;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export const APPOINTMENT_INCLUDES = {
  customer: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
      tenantId: true
    }
  },
  staff: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isVerified: true,
          tenantId: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true
        }
      }
    }
  },
  services: {
    include: {
      tenantService: {
        include: {
          category: true
        }
      },
      staff: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    }
  },
  salons: {
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      address: true,
      zipCode: true,
      city: true,
      phone: true,
      email: true,
      website: true,
      logo: true,
      banner: true,
      isVerified: true,
      isDeleted: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      ownerId: true,
      imageUrl: true,
      tenantId: true,
      salonStaff: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isVerified: true,
              tenantId: true,
              createdAt: true,
              updatedAt: true,
              lastLoginAt: true
            }
          }
        }
      }
    }
  },
  reviews: true,
  productSales: true
} as const;
