import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma/prisma.service';
import { AppointmentsFilterDto } from '../dto/appointment-filter.dto';
import { AppointmentDto } from '../dto/appointment.dto';
import { AppointmentsOverviewDto } from '../dto/appointments-overview.dto';

// Local error class to replace NestJS dependency
class InternalServerErrorException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InternalServerErrorException';
  }
}

// Import shared appointment status utilities
import { AppointmentStatus, isAppointmentStatus } from '@shared/enums/appointment-status.enum';

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
      // Use pagination values from filters (with defaults)
      const limit = filters.limit || 10;
      const offset = filters.offset || 0;
      
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
      
      // Add status filter if provided and not 'all'
      if (filters.status && filters.status.toString().toLowerCase() !== 'all') {
        if (isAppointmentStatus(filters.status.toString())) {
          baseWhere.status = filters.status.toString() as any; // Safe cast since we've validated it's a valid status
        }
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
        // Map status distribution with proper type safety
        statusDistribution: Object.values(AppointmentStatus).reduce<Record<AppointmentStatus, number>>(
          (acc, status) => {
            const statusCount = statusCounts.find(item => item.status === status);
            acc[status] = statusCount?._count || 0;
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
        
        if (filters.status) {
          const statusStr = filters.status.toString();
          // Only apply status filter if it's a valid status and not 'all'
          if (statusStr.toLowerCase() !== 'all' && isAppointmentStatus(statusStr)) {
            where.status = statusStr as any; // Safe cast since we've validated it's a valid status
          }
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
    
    // Map to a valid AppointmentStatus with fallback to PENDING
    const status = isAppointmentStatus(appointment.status) 
      ? appointment.status 
      : AppointmentStatus.PENDING;
    
    // Ensure all required fields have proper defaults
    const dto: AppointmentDto = {
      id: appointment.id || '',
      title: service?.name || 'Appointment',
      description: appointment.notes || '',
      startTime: appointment.startTime?.toISOString() || new Date().toISOString(),
      endTime: appointment.endTime?.toISOString() || new Date().toISOString(),
      status,
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
}