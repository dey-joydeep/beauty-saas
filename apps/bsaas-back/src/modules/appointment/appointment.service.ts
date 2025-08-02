import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { Prisma, PrismaClient, AppointmentStatus as PrismaAppointmentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { AppointmentsFilterDto, AppointmentsOverviewDto } from './dto/appointments-overview.dto';
import { AppointmentServiceWithDetails, AppointmentStatus, AppointmentWithDetails, RawAppointment, StaffWithUser, UserWithMinimalInfo, AppointmentDto } from './types/appointment.types';

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

type NotificationServiceType = {
  sendNotification: (userId: string, type: NotificationType, data: any) => Promise<void>;
  createNotification: (data: {
    type: NotificationType;
    userId: string;
    referenceId: string;
    metadata: Record<string, any>;
  }) => Promise<void>;
};

type LoggerService = Logger;

// Status mapping from string to enum
const statusMap: Record<string, string> = {
  'PENDING': 'booked',
  'CONFIRMED': 'booked',
  'IN_PROGRESS': 'booked',
  'COMPLETED': 'completed',
  'CANCELLED': 'cancelled',
  'NO_SHOW': 'cancelled',
  'BOOKED': 'booked'
};

// Type for appointment status mapping
interface AppointmentStatusCounts {
  [AppointmentStatus.PENDING]: number;
  [AppointmentStatus.CONFIRMED]: number;
  [AppointmentStatus.IN_PROGRESS]: number;
  [AppointmentStatus.COMPLETED]: number;
  [AppointmentStatus.CANCELLED]: number;
  [AppointmentStatus.NO_SHOW]: number;
  [AppointmentStatus.BOOKED]: number;
  [key: string]: number;
}

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

  constructor(
    @Inject(forwardRef(() => PrismaService))
    private readonly prisma: PrismaServiceType,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationServiceType,
  ) {}

//   /**
//    * Safely convert Prisma.Decimal to number
//    * @param value - The value to convert (can be Decimal, number, string, or null/undefined)
//    * @returns The converted number or 0 if conversion fails
//    */
//   private toNumber(value: any): number {
//     if (value === null || value === undefined) return 0;
//     if (typeof value === 'number') return value;
//     if (typeof value === 'string') {
//       const parsed = parseFloat(value);
//       return isNaN(parsed) ? 0 : parsed;
//     }
//     if (typeof value === 'boolean') return value ? 1 : 0;
//     return 0;
//   }

//   /**
//    * Maps a user object to UserWithMinimalInfo type
//    * @param user - The user object to map
//    * @returns Mapped UserWithMinimalInfo
//    */
//   private mapToUserWithMinimalInfo(user: any): UserWithMinimalInfo | null {
//     if (!user) return null;
//     return {
//       id: user.id,
//       name: user.name || null,
//       email: user.email,
//       phone: user.phone || null,
//       isActive: user.isActive,
//       isVerified: user.isVerified || false,
//       lastLoginAt: user.lastLoginAt || null,
//       avatarUrl: user.avatarUrl || null,
//       tenantId: user.tenantId || null,
//       createdAt: user.createdAt,
//       updatedAt: user.updatedAt
//     };
//   }

//   /**
//    * Maps a raw staff object to StaffWithUser type
//    * @param staff - The staff object from Prisma
//    * @returns Mapped StaffWithUser object
//    */
//   private mapToStaffWithUser(staff: any): StaffWithUser | null{
//     if (!staff) return null;
//     return {
//       id: staff.id,
//       userId: staff.userId,
//       salonId: staff.salonId,
//       position: staff.position || null,
//       hireDate: staff.hireDate || null,
//       isActive: staff.isActive,
//       createdAt: staff.createdAt,
//       updatedAt: staff.updatedAt,
//       user: staff.user ? this.mapToUserWithMinimalInfo(staff.user) : null
//     };
//   }

//   /**
//    * Maps a raw appointment to AppointmentDto
//    * @param appointment - The raw appointment data
//    * @returns Mapped AppointmentDto
//    */
//   private mapToAppointmentDto(appointment: any): AppointmentDto {
//     if (!appointment) throw new Error('Invalid appointment data');
    
//     return {
//       id: appointment.id,
//       tenantId: appointment.tenantId,
//       customerId: appointment.customerId,
//       staffId: appointment.staffId,
//       status: this.mapStatus(appointment.status),
//       appointmentDate: appointment.appointmentDate,
//       startTime: appointment.startTime,
//       endTime: appointment.endTime,
//       duration: appointment.duration || 0,
//       notes: appointment.notes || null,
//       cancellationReason: appointment.cancellationReason || null,
//       cancellationDate: appointment.cancellationDate || null,
//       noShow: appointment.noShow || false,
//       reminderSent: appointment.reminderSent || false,
//       confirmationSent: appointment.confirmationSent || false,
//       totalPrice: this.toNumber(appointment.totalPrice),
//       taxAmount: this.toNumber(appointment.taxAmount),
//       discountAmount: this.toNumber(appointment.discountAmount),
//       finalPrice: this.toNumber(appointment.finalPrice),
//       paymentStatus: appointment.paymentStatus || 'pending',
//       paymentMethod: appointment.paymentMethod || null,
//       paymentDate: appointment.paymentDate || null,
//       paymentTransactionId: appointment.paymentTransactionId || null,
//       metadata: appointment.metadata || null,
//       source: appointment.source || 'web',
//       isRecurring: appointment.isRecurring || false,
//       recurringAppointmentId: appointment.recurringAppointmentId || null,
//       createdAt: appointment.createdAt,
//       updatedAt: appointment.updatedAt,
//       deletedAt: appointment.deletedAt || null
//     };
//   }

//   /**
//    * Maps a status string to AppointmentStatus enum
//    * @param status - The status string to map
//    * @returns Mapped AppointmentStatus
//    */
//   private mapStatus(status: string): AppointmentStatus {
//     if (!status) return AppointmentStatus.PENDING;
    
//     const statusMap: Record<string, AppointmentStatus> = {
//       'pending': AppointmentStatus.PENDING,
//       'confirmed': AppointmentStatus.CONFIRMED,
//       'in_progress': AppointmentStatus.IN_PROGRESS,
//       'completed': AppointmentStatus.COMPLETED,
//       'cancelled': AppointmentStatus.CANCELLED,
//       'no_show': AppointmentStatus.NO_SHOW
//     };
    
//     return statusMap[status.toLowerCase()] || AppointmentStatus.PENDING;
//   }

//   // LoggerService implementation
//   log(message: string, context?: string) {
//     this.logger.log(message, context);
//   }

//   error(message: string, trace: string, context?: string) {
//     this.logger.error(message, trace, context);
//   }

//   warn(message: string, context?: string) {
//     this.logger.warn(message, context);
//   }

//   debug(message: string, context?: string) {
//     this.logger.debug?.(message, context);
//   }

//   verbose(message: string, context?: string) {
//     this.logger.verbose?.(message, context);
//   }

//   /**
//    * Get appointments for a specific user
//    * @param userId - The ID of the user
//    * @returns Promise with an array of appointments for the user
//    */
//   async getAppointmentsByUser(userId: string): Promise<AppointmentWithDetails[]> {
//     try {
//       // First, verify the user exists
//       const user = await this.prisma.user.findUnique({
//         where: { id: userId },
//         select: { id: true }
//       });

//       if (!user) {
//         throw new NotFoundException(`User with ID ${userId} not found`);
//       }

//       // Get all appointments for the user with necessary relations
//       const appointments = await this.prisma.appointment.findMany({
//         where: { customerId: userId },
//         include: {
//           customer: {
//             select: {
//               id: true,
//               name: true,
//               email: true,
//               phone: true,
//             },
//           },
//           staff: {
//             include: {
//               user: {
//                 select: {
//                   id: true,
//                   name: true,
//                   email: true,
//                 },
//               },
//             },
//           },
//           services: {
//             include: {
//               tenantService: {
//                 select: {
//                   id: true,
//                   name: true,
//                   description: true,
//                   price: true,
//                   duration: true,
//                   isActive: true,
//                 },
//               },
//             },
//           },
//           salons: {
//             select: {
//               id: true,
//               name: true,
//               address: true,
//               city: true,
//               state: true,
//               postalCode: true,
//               country: true,
//               phone: true,
//               email: true,
//             },
//           },
//           reviews: {
//             select: {
//               id: true,
//               rating: true,
//               comment: true,
//               isAnonymous: true,
//               isApproved: true,
//               response: true,
//               responseDate: true,
//               createdAt: true,
//               updatedAt: true,
//             },
//           },
//           productSales: {
//             include: {
//               tenantProduct: {
//                 select: {
//                   id: true,
//                   name: true,
//                   description: true,
//                   price: true,
//                   isActive: true,
//                 },
//               },
//             },
//           },
//         },
//         orderBy: { startTime: 'desc' },
//       });

//       // Map the appointments to the expected format
//       return appointments.map(appointment => {
//         try {
//           return this.toAppointmentWithDetails(appointment as unknown as RawAppointment);
//         } catch (error) {
//           this.logger.error(`Error mapping appointment ${appointment.id}:`, error);
//           return null;
//         }
//       }).filter((appt): appt is AppointmentWithDetails => appt !== null);
//     } catch (error) {
//       this.logger.error(`Error fetching appointments for user ${userId}:`, error);
//       throw new InternalServerErrorException('Failed to fetch user appointments');
//     }
//   }

//   /**
//    * Get appointments overview with statistics
//    * @param tenantId - The ID of the tenant
//    * @param filter - Filters for the appointments
//    * @returns Promise with appointments overview and statistics
//    */
//   async getAppointmentsOverview(
//     tenantId: string,
//     filter: AppointmentsFilterDto,
//   ): Promise<AppointmentsOverviewDto> {
//     try {
//       // Set default date range to last 30 days if not provided
//       const endDate = filter.endDate ? new Date(filter.endDate) : new Date();
//       const startDate = filter.startDate
//         ? new Date(filter.startDate)
//         : new Date(endDate);
//       startDate.setDate(startDate.getDate() - 30);

//       // Build the where clause for the query
//       const where: Prisma.AppointmentWhereInput = {
//         tenantId,
//         startTime: {
//           gte: startDate,
//           lte: endDate,
//         },
//       };

//       // Add optional filters
//       if (filter.status) {
//         where.status = filter.status as AppointmentStatus;
//       }
//       if (filter.salonId) {
//         where.salons = {
//           some: {
//             id: filter.salonId
//           }
//         };
//       }
//       if (filter.staffId) {
//         where.staffId = filter.staffId;
//       }

//       // Get all appointments with necessary relations
//       const appointments = await this.prisma.appointment.findMany({
//         where,
//         include: {
//           customer: {
//             select: {
//               id: true,
//               email: true,
//               name: true,
//               phone: true,
//             },
//           },
//           staff: {
//             include: {
//               user: {
//                 select: {
//                   id: true,
//                   email: true,
//                   name: true,
//                   phone: true,
//                 },
//               },
//             },
//           },
//           services: {
//             include: {
//               tenantService: {
//                 select: {
//                   id: true,
//                   name: true,
//                   description: true,
//                   price: true,
//                   duration: true,
//                   isActive: true,
//                 },
//               },
//               staff: {
//                 include: {
//                   user: {
//                     select: {
//                       id: true,
//                       name: true,
//                       email: true,
//                     },
//                   },
//                 },
//               },
//             },
//           },
//           salons: {
//             select: {
//               id: true,
//               name: true,
//               // address: true,
//               // city: true,
//               // state: true,
//               // postalCode: true,
//               // country: true,
//               phone: true,
//               email: true,
//             },
//           },
//           reviews: {
//             select: {
//               id: true,
//               rating: true,
//               comment: true,
//               isAnonymous: true,
//               isApproved: true,
//               response: true,
//               // responseDate: true,
//               createdAt: true,
//               updatedAt: true,
//               // customer: {
//               //   select: {
//               //     id: true,
//               //     name: true,
//               //     email: true,
//               //   },
//               },
//             },
//           },
//           // productSales: {
//           //   include: {
//           //     tenantProduct: {
//           //       select: {
//           //         id: true,
//           //         name: true,
//           //         description: true,
//           //         price: true,
//           //         isActive: true,
//           //         sku: true,
//           //         barcode: true,
//           //       },
//           //     },
//           //   },
//           // },
//         },
//       });

//       // Cast appointments to the correct type for filtering and mapping
//       const typedAppointments = appointments as unknown as Array<{
//         status: string;
//         startTime: Date | null;
//         endTime: Date | null;
//         services?: Array<{
//           tenantService: { price: Prisma.Decimal | number | null } | null;
//           quantity?: number;
//         }>;
//         productSales?: Array<{
//           totalPrice: Prisma.Decimal | number | null;
//         }>;
//       }>;

//       // Calculate statistics with proper type checking
//       const totalAppointments = typedAppointments.length;
//       const completedAppointments = typedAppointments.filter(
//         (a) => a.status === 'COMPLETED',
//       ).length;
//       const cancelledAppointments = typedAppointments.filter(
//         (a) => a.status === 'CANCELLED',
//       ).length;
//       const upcomingAppointments = typedAppointments.filter(
//         (a) => a.status === 'CONFIRMED' && a.startTime && a.startTime > new Date(),
//       ).length;

//       // Define types for service and product sale items
//       type ServiceItem = {
//         tenantService: { price: Prisma.Decimal | number | null } | null;
//         quantity?: number;
//       };

//       type ProductSaleItem = {
//         totalPrice: Prisma.Decimal | number | null;
//       };

//       // Define a type for the appointment with all required properties
//       type AppointmentWithAllProperties = AppointmentWithRelations & {
//         services?: Array<{
//           tenantService: { price: Prisma.Decimal | number | null } | null;
//           quantity?: number;
//         }>;
//         productSales?: Array<{
//           totalPrice: Prisma.Decimal | number | null;
//         }>;
//         startTime: Date | null;
//         endTime: Date | null;
//       };

//       // Calculate total revenue from completed appointments with proper type assertions
//       const totalRevenue = (appointments as unknown as AppointmentWithAllProperties[])
//         .filter((a) => a.status === 'COMPLETED')
//         .reduce((sum: number, appointment: AppointmentWithAllProperties) => {
//           const services = appointment.services || [];
//           const servicesTotal = services.reduce(
//             (serviceSum: number, service) => {
//               const price = service.tenantService?.price || 0;
//               const quantity = service.quantity || 1;
//               return serviceSum + this.toNumber(price) * quantity;
//             },
//             0,
//           );
          
//           const productSales = appointment.productSales || [];
//           const productsTotal = productSales.reduce(
//             (productSum: number, sale) => 
//               productSum + this.toNumber(sale.totalPrice || 0),
//             0,
//           );
//           return sum + servicesTotal + productsTotal;
//         }, 0);

//       // Calculate average appointment duration in minutes with proper type checking
//       const totalDuration = typedAppointments
//         .filter((a) => a.status === 'COMPLETED' && a.startTime && a.endTime)
//         .reduce((sum: number, appointment) => {
//           if (appointment.startTime && appointment.endTime) {
//             const duration = appointment.endTime.getTime() - appointment.startTime.getTime();
//             return sum + duration;
//           }
//           return sum;
//         }, 0);
      
//       const completedCount = typedAppointments.filter(a => a.status === 'COMPLETED').length;
//       const averageDuration = completedCount > 0
//         ? Math.round(totalDuration / (completedCount * 60000))
//         : 0;

//       // Initialize status distribution with all possible statuses set to 0
//       const statusDistribution: Record<AppointmentStatus, number> = Object.values(AppointmentStatus).reduce((acc, status) => {
//         acc[status] = 0;
//         return acc;
//       }, {} as Record<AppointmentStatus, number>);

//       // Count status occurrences with type safety
//       for (const appt of appointments) {
//         if (appt.status && appt.status in statusDistribution) {
//           statusDistribution[appt.status as AppointmentStatus]++;
//         }
//       }

//       // Map appointments to DTOs for upcoming and recent appointments
//       const now = new Date();
//       const upcomingAppts = appointments
//         .filter((appt): appt is typeof appt & { startTime: Date } => 
//           appt.startTime !== null && appt.startTime !== undefined
//         )
//         .filter(appt => appt.startTime > now)
//         .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
//         .slice(0, 10)
//         .map(appt => this.mapToAppointmentDto(appt as any));

//       const recentAppts = appointments
//         .filter((appt): appt is typeof appt & { endTime: Date } => 
//           appt.endTime !== null && appt.endTime !== undefined
//         )
//         .filter(appt => appt.endTime <= now)
//         .sort((a, b) => b.endTime.getTime() - a.endTime.getTime())
//         .slice(0, 5)
//         .map(appt => this.mapToAppointmentDto(appt as any));

//       // Calculate daily appointments count for the last 30 days
//       const dailyAppts: Record<string, number> = {};
//       const thirtyDaysAgo = new Date();
//       thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
//       for (const appt of appointments) {
//         if (!appt.startTime || appt.startTime < thirtyDaysAgo) continue;
        
//         const dateStr = appt.startTime.toISOString().split('T')[0];
//         dailyAppts[dateStr] = (dailyAppts[dateStr] || 0) + 1;
//       }

//       // Prepare the result with proper typing
//       const result: AppointmentsOverviewDto = {
//         totalAppointments,
//         bookedAppointments: statusDistribution[AppointmentStatus.BOOKED],
//         completedAppointments: statusDistribution[AppointmentStatus.COMPLETED],
//         cancelledAppointments: statusDistribution[AppointmentStatus.CANCELLED],
//         totalRevenue,
//         averageDuration: averageDuration || 0,
//         upcomingAppointments: upcomingAppts,
//         recentAppointments: recentAppts,
//         statusDistribution,
//         dailyAppointments: dailyAppts
//       };

//       return result;
//         id: true,
//         name: true,
//         address: true,
//         city: true,
//         state: true,
//         postalCode: true,
//         country: true,
//         phone: true,
//         email: true,
//       },
//     },
//     reviews: {
//       select: {
//         id: true,
//         rating: true,
//         comment: true,
//         isAnonymous: true,
//         isApproved: true,
//         response: true,
//         responseDate: true,
//         createdAt: true,
//         updatedAt: true,
//         customer: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//           },
//         },
//       },
//     },
//     productSales: {
//       include: {
//         tenantProduct: {
//           select: {
//             id: true,
//             name: true,
//             description: true,
//             price: true,
//             isActive: true,
//             sku: true,
//             barcode: true,
//           },
//         },
//       },
//     },
//   },
// });

// // Cast appointments to the correct type for filtering and mapping
// const typedAppointments = appointments as unknown as Array<{
//   status: string;
//   startTime: Date | null;
//   endTime: Date | null;
//   services?: Array<{
//     tenantService: { price: Prisma.Decimal | number | null } | null;
//     quantity?: number;
//   }>;
//   productSales?: Array<{
//     totalPrice: Prisma.Decimal | number | null;
//   }>;
// }>;

// // Calculate statistics with proper type checking
// const totalAppointments = typedAppointments.length;
// const completedAppointments = typedAppointments.filter(
//   (a) => a.status === 'COMPLETED',
// ).length;
// const cancelledAppointments = typedAppointments.filter(
//   (a) => a.status === 'CANCELLED',
// ).length;
// const upcomingAppointments = typedAppointments.filter(
//   (a) => a.status === 'CONFIRMED' && a.startTime && a.startTime > new Date(),
// ).length;
//       });

//       // Get recent appointments (last 5)
//       const recentAppointments = appointments
//         .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
//         .slice(0, 5)
//         .map((appt) => this.toAppointmentWithDetails(appt as any))
//         .filter((a): a is AppointmentWithDetails => a !== null);

//       // Get upcoming appointments (next 5)
//       const upcomingAppointmentsList = appointments
//         .filter((a) => a.startTime > new Date() && a.status === 'CONFIRMED')
//         .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
//         .slice(0, 5)
//         .map((appt) => this.toAppointmentWithDetails(appt as any))
//         .filter((a): a is AppointmentWithDetails => a !== null);

//       // Map to the DTO with proper type conversion
//       const result: AppointmentsOverviewDto = {
//         total: totalAppointments,
//         completed: completedAppointments,
//         cancelled: cancelledAppointments,
//         upcoming: upcomingAppointmentsList.length,
//         totalRevenue,
//         averageDuration,
//         recentAppointments: recentAppointments.map(appt => this.mapToAppointmentDto(appt)),
//         upcomingAppointments: upcomingAppointmentsList.map(appt => this.mapToAppointmentDto(appt)),
//         statusDistribution,
//         dailyCounts: Object.entries(dailyCounts).map(([date, count]) => ({
//           date,
//           count,
//         })),
//       };

//       return result;

//       // ... rest of the method remains the same ...
//     } catch (error) {
//       this.logger.error('Error fetching appointments overview', error);
//       throw new InternalServerErrorException('Failed to fetch appointments overview');
//     }
//   }


//   private toAppointmentWithDetails(appointment: RawAppointment): AppointmentWithDetails | null {
//     if (!appointment) {
//       return null;
//     }

//     // Map customer with proper typing
//     const customer = appointment.customer ? this.mapToUserWithMinimalInfo(appointment.customer) : null;
    
//     // Map staff with proper typing
//     const staff = appointment.staff ? this.mapToStaffWithUser(appointment.staff) : null;

//     // Helper function to convert Decimal to number if needed
//     const toNumber = (value: Decimal | number | null | undefined): number => {
//       if (value === null || value === undefined) return 0;
//       if (typeof value === 'number') return value;
//       if ('toNumber' in value) return value.toNumber();
//       return 0;
//     };

//     // Map services with proper typing
//     const services = (appointment.services || []).map(service => {
//       // Map staff for the service if available
//       const serviceStaff = service.staff ? this.mapToStaffWithUser(service.staff) : null;
      
//       // Map the tenant service with only the fields defined in the type
//       let tenantService = null;
//       if (service.tenantService) {
//         tenantService = {
//           id: service.tenantService.id,
//           name: service.tenantService.name || '',
//           description: service.tenantService.description || null,
//           price: service.tenantService.price, // Keep as Decimal for consistency with the type
//           duration: service.tenantService.duration || 0,
//           tenantId: service.tenantService.tenantId,
//           salonId: service.tenantService.salonId || null,
//           serviceCategoryId: service.tenantService.serviceCategoryId || null,
//           isActive: service.tenantService.isActive !== false,
//           metadata: service.tenantService.metadata || {},
//           taxRate: service.tenantService.taxRate, // Keep as Decimal for consistency
//           isTaxable: service.tenantService.isTaxable || false,
//           createdAt: service.tenantService.createdAt || new Date(),
//           updatedAt: service.tenantService.updatedAt || new Date(),
//         };
//       }
      
//       // Map the service with details, ensuring proper number types
//       const serviceWithDetails: AppointmentServiceWithDetails = {
//         id: service.id,
//         appointmentId: service.appointmentId,
//         tenantServiceId: service.tenantServiceId,
//         staffId: service.staffId,
//         price: toNumber(service.price),
//         duration: service.duration || 0,
//         notes: service.notes || null,
//         createdAt: service.createdAt || new Date(),
//         updatedAt: service.updatedAt || new Date(),
//         staff: serviceStaff,
//         tenantService: tenantService
//       };
      
//       return serviceWithDetails;
//     });
    
//     // Map salons with proper typing
//     const mappedSalons = (appointment.salons || []).map(salon => ({
//       id: salon.id,
//       name: salon.name || '',
//       description: salon.description || null,
//       phone: salon.phone || null,
//       email: salon.email || null,
//       address: salon.address || null,
//       city: salon.city || null,
//       state: (salon as any).state || null,
//       postalCode: (salon as any).postalCode || null,
//       country: (salon as any).country || null,
//       timezone: (salon as any).timezone || 'UTC',
//       ownerId: (salon as any).ownerId || null,
//       imageUrl: (salon as any).imageUrl || null,
//       isActive: salon.isActive !== false,
//       tenantId: salon.tenantId,
//       createdAt: salon.createdAt || new Date(),
//       updatedAt: salon.updatedAt || new Date(),
//     }));
    
//     // Map product sales with proper typing
//     const productSales = (appointment.productSales || []).map(sale => {
//       const pricePerUnit = sale.pricePerUnit && typeof sale.pricePerUnit === 'object' && 'toNumber' in sale.pricePerUnit
//         ? (sale.pricePerUnit as Decimal).toNumber()
//         : (sale.pricePerUnit as number) || 0;
      
//       const discount = sale.discount && typeof sale.discount === 'object' && 'toNumber' in sale.discount
//         ? (sale.discount as Decimal).toNumber()
//         : (sale.discount as number) || 0;
      
//       const quantity = sale.quantity || 1;
//       const totalPrice = (pricePerUnit * quantity) - discount;
      
//       return {
//         id: sale.id,
//         appointmentId: sale.appointmentId,
//         productId: (sale as any).productId || (sale as any).tenantProductId,
//         quantity,
//         pricePerUnit,
//         unitPrice: pricePerUnit,
//         totalPrice,
//         discount,
//         taxRate: sale.taxRate && typeof sale.taxRate === 'object' && 'toNumber' in sale.taxRate
//           ? (sale.taxRate as Decimal).toNumber()
//           : (sale.taxRate as number) || 0,
//         taxAmount: 0, // Calculate if needed
//         notes: sale.notes || null,
//         isRefunded: (sale as any).isRefunded || false,
//         refundedAt: (sale as any).refundedAt || null,
//         refundReason: (sale as any).refundReason || null,
//         tenantId: (sale as any).tenantId || appointment.tenantId,
//         customerId: (sale as any).customerId || appointment.customerId,
//         metadata: (sale as any).metadata || {},
//         createdAt: sale.createdAt || new Date(),
//         updatedAt: sale.updatedAt || new Date(),
//         product: (sale as any).product ? {
//           id: (sale as any).product.id,
//           name: (sale as any).product.name || '',
//           description: (sale as any).product.description || null,
//           price: (sale as any).product.price && typeof (sale as any).product.price === 'object' && 'toNumber' in (sale as any).product.price
//             ? ((sale as any).product.price as Decimal).toNumber()
//             : ((sale as any).product.price as number) || 0,
//           tenantId: (sale as any).product.tenantId,
//           salonId: (sale as any).product.salonId || null,
//           serviceCategoryId: (sale as any).product.serviceCategoryId || null,
//           isActive: (sale as any).product.isActive !== false,
//           taxRate: (sale as any).product.taxRate || 0,
//           isTaxable: (sale as any).product.isTaxable || false,
//           sku: (sale as any).product.sku || null,
//           barcode: (sale as any).product.barcode || null,
//           quantityInStock: (sale as any).product.quantityInStock || 0,
//           reorderPoint: (sale as any).product.reorderPoint || 0,
//           metadata: (sale as any).product.metadata || {},
//           createdAt: (sale as any).product.createdAt || new Date(),
//           updatedAt: (sale as any).product.updatedAt || new Date()
//         } : null
//       };
//     });
    
//     // Map reviews with proper typing
//     const reviews = (appointment.reviews || []).map(review => ({
//       id: review.id,
//       appointmentId: review.appointmentId,
//       rating: review.rating || 0,
//       comment: review.comment || null,
//       customerId: review.customerId,
//       staffId: review.staffId || null,
//       isAnonymous: review.isAnonymous || false,
//       isApproved: review.isApproved !== false,
//       response: review.response || null,
//       responseDate: review.responseDate || null,
//       createdAt: review.createdAt || new Date(),
//       updatedAt: review.updatedAt || new Date(),
//       // Add any missing required fields from Review type
//       tenantId: (review as any).tenantId || appointment.tenantId,
//       userId: review.customerId, // Map customerId to userId
//       salonId: (review as any).salonId || (appointment.salons?.[0]?.id || null),
//       adminComment: (review as any).adminComment || null,
//       respondedAt: review.responseDate || null
//     }));
    
//     // Create the final appointment with details
//     const appointmentWithDetails: AppointmentWithDetails = {
//       ...appointment,
//       customer: customer || undefined,
//       staff: staff || undefined,
//       services,
//       productSales,
//       reviews,
//       status: this.mapToAppointmentStatus(appointment.status as string),
//       // Ensure all required fields are included
//       id: appointment.id,
//       tenantId: appointment.tenantId,
//       startTime: appointment.startTime,
//       endTime: appointment.endTime,
//       createdAt: appointment.createdAt || new Date(),
//       updatedAt: appointment.updatedAt || new Date(),
//     };

//     return appointmentWithDetails;

//   }

//   /**
//    * Convert a raw appointment to AppointmentWithDetails
//    * @param appointment - The raw appointment data
//    * @returns Formatted appointment with details or null if invalid
//    */
//   // Helper method to map status string to AppointmentStatus
//   /**
//    * Maps a status string to the corresponding AppointmentStatus enum value
//    * @param status - The status string to map
//    * @returns The corresponding AppointmentStatus or PENDING if not found
//    */
//   private mapStatus(status: string): AppointmentStatus {
//     if (!status) return AppointmentStatus.PENDING;
    
//     const normalizedStatus = status.toUpperCase().trim();
//     const statusMap: Record<string, AppointmentStatus> = {
//       'PENDING': AppointmentStatus.PENDING,
//       'CONFIRMED': AppointmentStatus.CONFIRMED,
//       'IN_PROGRESS': AppointmentStatus.IN_PROGRESS,
//       'COMPLETED': AppointmentStatus.COMPLETED,
//       'CANCELLED': AppointmentStatus.CANCELLED,
//       'NO_SHOW': AppointmentStatus.NO_SHOW,
//       'BOOKED': AppointmentStatus.BOOKED
//     };
    
//     return statusMap[normalizedStatus] || AppointmentStatus.PENDING;
//   }
}