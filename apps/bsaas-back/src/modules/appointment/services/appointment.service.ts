import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Prisma, AppointmentStatus as PrismaAppointmentStatus } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma/prisma.service';
import { AppointmentDto, AppointmentsFilterDto, AppointmentsOverviewDto } from '../dto/requests/appointments-overview.dto';
import { StaffWithUser, UserWithMinimalInfo } from '../types/appointment.types';

// Define AppointmentStatus enum to match Prisma's enum
export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  BOOKED = 'BOOKED'
}

type Decimal = Prisma.Decimal;

// Define local type aliases for Prisma types
type PrismaDecimal = Decimal;
type PrismaJsonValue = Record<string, unknown>;

// Define a type for the Prisma where clause
type PrismaWhereInput = {
  [key: string]: unknown;
  AND?: PrismaWhereInput[];
  OR?: PrismaWhereInput[];
  NOT?: PrismaWhereInput | PrismaWhereInput[];
};

// Define a type for Prisma client with our models
type PrismaClient = {
  $connect: () => Promise<void>;
  $disconnect: () => Promise<void>;
  $on: (event: string, callback: (e: any) => void) => void;
  $use: (params: any) => any;
  $transaction: <T>(fn: (prisma: any) => Promise<T>) => Promise<T>;
  $queryRaw: <T = any>(query: TemplateStringsArray | string, ...values: any[]) => Promise<T>;
  $executeRaw: (query: string, ...values: any[]) => Promise<number>;
  $queryRawUnsafe: <T = any>(query: string, ...values: any[]) => Promise<T>;
  $executeRawUnsafe: (query: string, ...values: any[]) => Promise<number>;
  
  // Define the appointment model methods
  appointment: {
    findMany: (args: any) => Promise<any[]>;
    findUnique: (args: any) => Promise<any | null>;
    create: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
    count: (args: any) => Promise<number>;
    groupBy: (args: any) => Promise<Array<{ status: string; _count: number }>>;
    aggregate: (args: any) => Promise<{ _sum?: { totalPrice?: number | null } | null }>;
  };
  // Add other models as needed
};

// Helper function to convert Decimal to number
const toNumber = (value: Decimal | number | string | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  return value.toNumber();
};

// Helper function to map appointment status to internal status
const mapStatus = (status: string): AppointmentStatus => {
  const statusMap: Record<string, AppointmentStatus> = {
    'PENDING': AppointmentStatus.PENDING,
    'CONFIRMED': AppointmentStatus.CONFIRMED,
    'IN_PROGRESS': AppointmentStatus.IN_PROGRESS,
    'COMPLETED': AppointmentStatus.COMPLETED,
    'CANCELLED': AppointmentStatus.CANCELLED,
    'NO_SHOW': AppointmentStatus.NO_SHOW,
    'BOOKED': AppointmentStatus.BOOKED
  };
  
  const normalizedStatus = status.toUpperCase();
  if (normalizedStatus in statusMap) {
    return statusMap[normalizedStatus as keyof typeof statusMap];
  }
  return AppointmentStatus.BOOKED;
};

// Import Prisma types for ProductSale and Review

// Base types that match our Prisma schema
type BaseAppointmentService = {
  id: string;
  appointmentId: string;
  tenantServiceId: string;
  staffId: string | null;
  price: Prisma.Decimal | number;
  duration: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  tenantService: {
    id: string;
    name: string;
    description: string | null;
    price: Prisma.Decimal | number;
    duration: number;
    tenantId: string;
    salonId: string | null;
    serviceCategoryId: string | null;
    isActive: boolean;
    metadata: Prisma.JsonValue;
    taxRate: number | null;
    isTaxable: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  staff: StaffWithUser | null;
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
  customer: UserWithMinimalInfo | null;
  staff: StaffWithUser | null;
};

type BaseProductSale = {
  id: string;
  appointmentId: string;
  tenantProductId: string | null;
  quantity: number;
  pricePerUnit: Prisma.Decimal | number;
  discount: Prisma.Decimal | number;
  taxRate: Prisma.Decimal | number;
  taxAmount: Prisma.Decimal | number;
  totalPrice: Prisma.Decimal | number;
  notes: string | null;
  isRefunded: boolean;
  refundedAt: Date | null;
  refundReason: string | null;
  tenantId: string;
  customerId: string | null;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
  product: {
    id: string;
    name: string;
    description: string | null;
    price: Prisma.Decimal | number;
    isActive: boolean;
    tenantId: string;
    salonId: string | null;
    serviceCategoryId: string | null;
    taxRate: number | null;
    isTaxable: boolean;
    sku: string | null;
    barcode: string | null;
    quantityInStock: number;
    reorderPoint: number;
    metadata: Prisma.JsonValue;
    createdAt: Date;
    updatedAt: Date;
  } | null;
};

type PrismaTransaction = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>;

enum NotificationType {
  APPOINTMENT_CREATED = 'APPOINTMENT_CREATED',
  APPOINTMENT_UPDATED = 'APPOINTMENT_UPDATED',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  APPOINTMENT_CONFIRMATION = 'APPOINTMENT_CONFIRMATION',
  APPOINTMENT_COMPLETED = 'APPOINTMENT_COMPLETED',
  APPOINTMENT_REVIEW_REQUEST = 'APPOINTMENT_REVIEW_REQUEST',
  APPOINTMENT_RESCHEDULED = 'APPOINTMENT_RESCHEDULED',
  APPOINTMENT_NEW = 'APPOINTMENT_NEW',
  APPOINTMENT_ASSIGNED = 'APPOINTMENT_ASSIGNED',
  APPOINTMENT_STATUS_CHANGED = 'APPOINTMENT_STATUS_CHANGED',
  APPOINTMENT_REMINDER_24H = 'APPOINTMENT_REMINDER_24H',
  APPOINTMENT_REMINDER_1H = 'APPOINTMENT_REMINDER_1H',
  APPOINTMENT_FOLLOW_UP = 'APPOINTMENT_FOLLOW_UP',
  APPOINTMENT_CUSTOM = 'APPOINTMENT_CUSTOM',
  APPOINTMENT_OTHER = 'APPOINTMENT_OTHER',
}

type ProductSaleWithProduct = any;

type PrismaServiceType = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use">;

// Status mapping from string to internal status
const statusMap: Record<string, string> = {
  'PENDING': 'booked',
  'CONFIRMED': 'booked',
  'IN_PROGRESS': 'inProgress',
  'COMPLETED': 'completed',
  'CANCELLED': 'cancelled',
  'NO_SHOW': 'noShow',
  'BOOKED': 'booked',
  'booked': 'booked',
  'inProgress': 'inProgress',
  'completed': 'completed',
  'cancelled': 'cancelled',
  'noShow': 'noShow'
} as const;

type StatusKey = keyof typeof statusMap;
type StatusValue = typeof statusMap[StatusKey];

type AppointmentStatusCounts = {
  [key in keyof typeof AppointmentStatus]: number;
} & {
  [key: string]: number; // Allow dynamic access
};

// Interface for appointment statistics
export interface AppointmentStats {
  total: number;
  completed: number;
  cancelled: number;
  upcoming: number;
  inProgress: number;
  noShow: number;
  booked: number;
  pending: number;
  confirmed: number;
  statusCounts: AppointmentStatusCounts;
  dailyCounts: Record<string, number>;
  revenue: number;
  averageRating: number;
}

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);
  
  constructor(private prisma: PrismaService) {
    this.logger.log('AppointmentService initialized');
  }

  /**
   * Safely convert Prisma.Decimal to number
   * @param value - The value to convert (can be Decimal, number, string, or null/undefined)
   * @returns The converted number or 0 if conversion fails
   */
  private toNumber(value: unknown): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === 'object' && value !== null && 'toNumber' in value && typeof (value as { toNumber: () => unknown }).toNumber === 'function') {
      return Number((value as { toNumber: () => unknown }).toNumber());
    }
    if (typeof value === 'boolean') return value ? 1 : 0;
    return 0;
  }

  /**
   * Get appointments overview with statistics
   * @param filters - Filter criteria for appointments
   * @param userId - The ID of the user to filter appointments for
   * @returns Overview data including counts, revenue, and recent appointments
   */
  async getAppointmentsOverview(
    filters: AppointmentsFilterDto,
    userId: string
  ): Promise<AppointmentsOverviewDto> {
    try {
      // Set default values for pagination
      const limit = filters.limit || 10;
      const offset = (filters.page ? filters.page - 1 : 0) * limit;
      
      // Build the base where clause for the query
      const baseWhere: Prisma.AppointmentWhereInput = {
        OR: [
          { customerId: userId },
          { staff: { userId } },
          { salons: { some: { ownerId: userId } } }
        ]
      };
      
      // Add date range filter if provided
      if (filters.startDate || filters.endDate) {
        baseWhere.startTime = {};
        if (filters.startDate) baseWhere.startTime.gte = new Date(filters.startDate);
        if (filters.endDate) baseWhere.startTime.lte = new Date(filters.endDate);
      }
      
      // Add status filter if provided
      if (filters.status) {
        baseWhere.status = filters.status as PrismaAppointmentStatus;
      }
      
      // Add customer, staff, or salon filters if provided
      if (filters.customerId) baseWhere.customerId = filters.customerId;
      if (filters.staffId) baseWhere.staffId = filters.staffId;
      if (filters.salonId) baseWhere.salons = { some: { id: filters.salonId } };
      
      // Get total count of appointments
      const totalAppointments = await this.prisma.appointment.count({ where: baseWhere });
      
      // Calculate total revenue from completed appointments
      const revenueResult = await this.prisma.$queryRaw<Array<{ total: number }>>`
        SELECT COALESCE(SUM("totalPrice"), 0) as total
        FROM "Appointment"
        WHERE status = 'COMPLETED'
        AND ("customerId" = ${userId} OR "staffId" IN (
          SELECT id FROM "Staff" WHERE "userId" = ${userId}
        ) OR "id" IN (
          SELECT "appointmentId" FROM "_AppointmentToSalon" WHERE "salonId" IN (
            SELECT id FROM "Salon" WHERE "ownerId" = ${userId}
          )
        ))
        ${filters.startDate ? Prisma.sql`AND "startTime" >= ${new Date(filters.startDate)}` : Prisma.empty}
        ${filters.endDate ? Prisma.sql`AND "startTime" <= ${new Date(filters.endDate)}` : Prisma.empty}
      `;

      const totalRevenue = revenueResult[0]?.total || 0;

      // Get counts by status
      const statusCounts = await this.prisma.appointment.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: true
      });
      
      // Get recent appointments
      const recentAppointments = await this.prisma.appointment.findMany({
        where: baseWhere,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatarUrl: true,
            },
          },
          staff: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  avatarUrl: true,
                },
              },
            },
          },
          services: {
            include: {
              tenantService: true
            }
          },
          salons: {
            select: {
              id: true,
              name: true
            },
            take: 1
          }
        },
        orderBy: { startTime: 'desc' },
        take: limit,
        skip: offset
      });
      
      // Helper function to get count by status with proper typing
      const getStatusCount = (status: string): number => {
        const count = statusCounts.find((item: { status: string; _count: number }) => 
          item.status === status
        )?._count;
        return typeof count === 'number' ? count : 0;
      };
      
      // Map the results to the DTO
      const overview: AppointmentsOverviewDto = {
        totalAppointments: totalAppointments,
        bookedAppointments: getStatusCount('BOOKED'),
        completedAppointments: getStatusCount('COMPLETED'),
        cancelledAppointments: getStatusCount('CANCELLED'),
        // Calculate total revenue from completed appointments
        totalRevenue: totalRevenue,
        // Calculate average duration (placeholder - would need actual calculation)
        averageDuration: 0,
        // Get upcoming appointments (filter those in the future)
        upcomingAppointments: recentAppointments
          .filter((appt: { startTime: Date }) => new Date(appt.startTime) > new Date())
          .map((appt: any) => this.mapToAppointmentDto(appt)),
        // Get recent appointments (limit to 5 most recent)
        recentAppointments: recentAppointments
          .slice(0, 5)
          .map((appt: any) => this.mapToAppointmentDto(appt)),
        // Map status distribution
        statusDistribution: statusCounts.reduce<Record<AppointmentStatus, number>>(
          (acc, curr) => {
            // Only include valid status values
            if (Object.values(AppointmentStatus).includes(curr.status as AppointmentStatus)) {
              acc[curr.status as AppointmentStatus] = curr._count;
            }
            return acc;
          }, 
          {} as Record<AppointmentStatus, number>
        ),
        // Initialize daily appointments (would need actual aggregation by day)
        dailyAppointments: {}
      };
      
      // Log debug information
      this.logger.debug(`Found ${totalAppointments} total appointments for user ${userId}`);
      this.logger.debug(`Status counts: ${JSON.stringify(statusCounts)}`);
      this.logger.debug(`Total revenue: ${totalRevenue}`);
      
      return overview;
    } catch (error) {
      this.logger.error('Error fetching appointments overview', error);
      throw new InternalServerErrorException('Failed to fetch appointments overview');
    }
  }
  
  /**
   * Get appointments for a specific user
   * @param userId - The ID of the user to get appointments for
   * @param filters - Optional filter criteria
   * @returns Array of appointment DTOs
   */
  async getAppointmentsByUser(
    userId: string,
    filters?: AppointmentsFilterDto,
  ): Promise<AppointmentDto[]> {
    try {
      const where: any = {
        customerId: userId,
      };

      // Apply filters if provided
      if (filters) {
        if (filters.startDate) {
          where.startTime = {
            gte: new Date(filters.startDate),
          };
        }
        
        if (filters.endDate) {
          where.startTime = where.startTime || {};
          where.startTime.lte = new Date(filters.endDate);
        }
        
        if (filters.status && filters.status !== 'all' && Object.values(AppointmentStatus).includes(filters.status as any)) {
          where.status = filters.status;
        }
      }

      const appointments = await this.prisma.appointment.findMany({
        where,
        include: {
          services: {
            include: {
              tenantService: true,
              staff: {
                include: {
                  user: true,
                },
              },
            },
          },
          customer: true,
          tenant: true,
        },
        orderBy: {
          startTime: 'desc',
        },
      });

      return appointments.map(appointment => this.mapToAppointmentDto(appointment));
    } catch (error) {
      this.logger.error('Error fetching user appointments', error);
      throw new InternalServerErrorException('Failed to fetch user appointments');
    }
  }

  /**
   * Get appointments for a specific tenant
   * @param tenantId - The ID of the tenant to get appointments for
   * @param filters - Optional filter criteria
   * @returns Array of appointment DTOs
   */
  async getTenantAppointments(tenantId: string, filters: AppointmentsFilterDto): Promise<AppointmentDto[]> {
    try {
      // Get the where clause from the filters DTO
      const { where: filterWhere, skip, take } = filters.toPrismaFilter();
      
      // Combine with tenant filter
      const where: any = {
        ...filterWhere,
        tenantId,
        status: {
          not: 'CANCELLED' // Exclude cancelled appointments by default
        }
      };

      const appointments = await this.prisma.appointment.findMany({
        where,
        skip,
        take,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              ...('avatarUrl' in this.prisma.user.fields ? { avatarUrl: true } : {})
            },
          },
          services: {
            include: {
              tenantService: true,
              staff: {
                include: {
                  user: true,
                },
              },
            },
          },
          tenant: true
        },
        orderBy: {
          startTime: 'desc',
        },
      });

      return appointments.map(appointment => this.mapToAppointmentDto(appointment));
    } catch (error) {
      this.logger.error(`Error getting tenant appointments for tenant ${tenantId}:`, error);
      throw new InternalServerErrorException('Failed to retrieve tenant appointments');
    }
  }

  /**
   * Maps an appointment entity to an AppointmentDto
   * @param appointment - The appointment entity to map
   * @returns The mapped AppointmentDto
   * @throws Error if appointment is not provided
   */
  public mapToAppointmentDto(appointment: any): AppointmentDto {
    if (!appointment) {
      throw new Error('Appointment is required');
    }

    // Get the first service for basic info (assuming single service per appointment for now)
    const service = appointment.services?.[0]?.tenantService || null;
    const salon = appointment.salons?.[0] || null;
    
    // Safely get customer and staff names
    const customerName = appointment.customer?.name || 'Unknown';
    const staffName = appointment.staff?.user?.name || 'Unassigned';
    
    // Map status to AppointmentStatus enum
    const status = mapStatus(appointment.status);
    
    // Ensure all required fields have proper defaults
    const dto: AppointmentDto = {
      id: appointment.id || '',
      title: service?.name || 'Appointment',
      description: appointment.notes || '',
      startTime: appointment.startTime?.toISOString() || new Date().toISOString(),
      endTime: appointment.endTime?.toISOString() || new Date().toISOString(),
      status: status,
      customerId: appointment.customerId || '',
      customerName: customerName,
      customerEmail: appointment.customer?.email || '',
      staffId: appointment.staffId || '',
      staffName: staffName,
      serviceId: service?.id || '',
      serviceName: service?.name || 'Unknown Service',
      duration: appointment.durationMinutes || 0,
      price: appointment.totalPrice ? this.toNumber(appointment.totalPrice) : 0,
      salonId: salon?.id || '',
      salonName: salon?.name || 'Unknown Salon',
      createdAt: appointment.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: appointment.updatedAt?.toISOString() || new Date().toISOString(),
    };

    return dto;
  }

  /**
   * Check if a user is eligible to review a service or tenant
   * @param userId - The ID of the user to check
   * @param id - The ID of the service or tenant being reviewed
   * @param type - The type of review ('service' or 'tenant')
   * @returns An object indicating eligibility and an optional message
   */
  public async checkUserEligibleToReview(
    userId: string,
    id: string,
    type: 'service' | 'tenant' = 'service'
  ): Promise<{ eligible: boolean; message?: string }> {
    try {
      if (type === 'service') {
        // Check if the user has any completed appointments for this service
        const completedAppointments = await this.prisma.appointment.findMany({
          where: {
            customerId: userId,
            services: {
              some: {
                tenantServiceId: id,
              },
            },
            status: 'COMPLETED',
          },
          include: {
            reviews: {
              where: {
                userId: userId,
              },
            },
          },
        });

        // If user has no completed appointments for this service, they can't review it
        if (completedAppointments.length === 0) {
          return {
            eligible: false,
            message: 'You must have completed an appointment for this service before you can review it.',
          };
        }

        // Check if user has already reviewed this service
        const hasExistingReview = completedAppointments.some(appt => 
          appt.reviews && appt.reviews.length > 0
        );

        if (hasExistingReview) {
          return {
            eligible: false,
            message: 'You have already reviewed this service.',
          };
        }
      } else {
        // Check if the user has any completed appointments with the tenant
        const completedAppointments = await this.prisma.appointment.findMany({
          where: {
            customerId: userId,
            tenantId: id,
            status: 'COMPLETED',
            endTime: {
              lt: new Date(), // Only count appointments that have already ended
            },
          },
          take: 1, // We only need to know if there's at least one
        });

        if (completedAppointments.length === 0) {
          return {
            eligible: false,
            message: 'You must have completed an appointment with this salon before you can review it.',
          };
        }

        // Check if the user has already reviewed this tenant
        const existingReview = await this.prisma.review.findFirst({
          where: {
            userId: userId,
            tenantId: id,
          },
        });

        if (existingReview) {
          return {
            eligible: false,
            message: 'You have already reviewed this salon.',
          };
        }
      }

      // If we get here, the user is eligible to write a review
      return {
        eligible: true,
      };
    } catch (error) {
      const entityType = type === 'service' ? 'service' : 'salon';
      this.logger.error(`Error checking review eligibility for user ${userId} and ${entityType} ${id}:`, error);
      throw new InternalServerErrorException(`Failed to check ${entityType} review eligibility`);
    }
  }

  /**
   * Helper function to map appointment status to internal status
   */
  private mapStatus(status: string): StatusValue {
    if (!status) return 'booked';
    
    const normalizedStatus = status.toUpperCase() as StatusKey;
    
    // Map similar statuses to standard ones
    switch (normalizedStatus) {
      case 'PENDING':
      case 'CONFIRMED':
        return 'booked';
      case 'IN_PROGRESS':
      case 'INPROGRESS':
        return 'inProgress';
      case 'COMPLETED':
      case 'DONE':
        return 'completed';
      case 'CANCELLED':
      case 'CANCELED':
        return 'cancelled';
      case 'NO_SHOW':
      case 'NOSHOW':
        return 'noShow';
      default:
        return 'booked';
    }
  };
}