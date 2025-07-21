import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AppointmentsFilterDto,
  AppointmentsOverviewDto,
  AppointmentStatus,
} from './dto/appointments-overview.dto';
import { addDays, format, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get appointments overview with statistics and upcoming appointments
   */
  async getAppointmentsOverview(filters?: AppointmentsFilterDto): Promise<AppointmentsOverviewDto> {
    const where = this.buildWhereClause(filters);

    // Get all appointments that match the filters
    const appointments = await this.prisma.appointment.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        staff: {
          select: { id: true, name: true },
        },
        service: {
          select: { id: true, name: true, duration: true, price: true },
        },
        salon: {
          select: { id: true, name: true },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    if (appointments.length === 0) {
      return this.getEmptyOverview();
    }

    const now = new Date();
    const thirtyDaysAgo = addDays(now, -30);

    // Filter appointments for different time periods
    const upcomingAppointments = appointments
      .filter((a) => isAfter(new Date(a.startTime), now))
      .slice(0, 10); // Limit to 10 upcoming appointments

    const recentAppointments = appointments
      .filter((a) => isBefore(new Date(a.startTime), now))
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 5); // Limit to 5 recent appointments

    // Calculate statistics
    const totalAppointments = appointments.length;
    const statusDistribution = this.countByStatus(appointments);
    const dailyAppointments = this.countDailyAppointments(appointments, thirtyDaysAgo, now);

    const totalRevenue = appointments
      .filter((a) => a.status === 'COMPLETED')
      .reduce((sum, a) => sum + (a.service?.price || 0), 0);

    const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');
    const averageDuration =
      completedAppointments.length > 0
        ? completedAppointments.reduce((sum, a) => sum + (a.service?.duration || 0), 0) /
          completedAppointments.length
        : 0;

    // Map to DTOs
    const mapToDto = (appointment: any) => ({
      id: appointment.id,
      title: appointment.title,
      description: appointment.description,
      startTime: appointment.startTime.toISOString(),
      endTime: appointment.endTime.toISOString(),
      status: appointment.status as AppointmentStatus,
      customerId: appointment.customer?.id,
      customerName: appointment.customer?.name,
      customerEmail: appointment.customer?.email,
      staffId: appointment.staff?.id,
      staffName: appointment.staff?.name,
      serviceId: appointment.service?.id,
      serviceName: appointment.service?.name,
      duration: appointment.service?.duration || 0,
      price: appointment.service?.price || 0,
      salonId: appointment.salon?.id,
      salonName: appointment.salon?.name,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    });

    return {
      totalAppointments,
      pendingAppointments: statusDistribution['PENDING'] || 0,
      confirmedAppointments: statusDistribution['CONFIRMED'] || 0,
      completedAppointments: statusDistribution['COMPLETED'] || 0,
      cancelledAppointments: statusDistribution['CANCELLED'] || 0,
      noShowAppointments: statusDistribution['NOSHOW'] || 0,
      totalRevenue,
      averageDuration,
      upcomingAppointments: upcomingAppointments.map(mapToDto),
      recentAppointments: recentAppointments.map(mapToDto),
      statusDistribution,
      dailyAppointments,
    };
  }

  /**
   * Build the WHERE clause for Prisma query based on filters
   */
  private buildWhereClause(filters?: AppointmentsFilterDto) {
    const where: any = {};

    if (filters?.startDate || filters?.endDate) {
      where.AND = [];

      if (filters.startDate) {
        where.AND.push({
          startTime: { gte: new Date(filters.startDate) },
        });
      }

      if (filters.endDate) {
        where.AND.push({
          startTime: { lte: new Date(filters.endDate) },
        });
      }
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.staffId) {
      where.staffId = filters.staffId;
    }

    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters?.serviceId) {
      where.serviceId = filters.serviceId;
    }

    return where;
  }

  /**
   * Count appointments by status
   */
  private countByStatus(appointments: any[]): Record<string, number> {
    return appointments.reduce(
      (acc, appointment) => {
        acc[appointment.status] = (acc[appointment.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  /**
   * Count daily appointments for the last 30 days
   */
  private countDailyAppointments(
    appointments: any[],
    startDate: Date,
    endDate: Date,
  ): Record<string, number> {
    const result: Record<string, number> = {};

    // Initialize all dates in the range with 0
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      result[dateKey] = 0;
      currentDate = addDays(currentDate, 1);
    }

    // Count appointments per day
    appointments.forEach((appointment) => {
      const dateKey = format(new Date(appointment.startTime), 'yyyy-MM-dd');
      if (result.hasOwnProperty(dateKey)) {
        result[dateKey]++;
      }
    });

    return result;
  }

  /**
   * Return empty overview when no appointments are found
   */
  private getEmptyOverview(): AppointmentsOverviewDto {
    return {
      totalAppointments: 0,
      pendingAppointments: 0,
      confirmedAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      noShowAppointments: 0,
      totalRevenue: 0,
      averageDuration: 0,
      upcomingAppointments: [],
      recentAppointments: [],
      statusDistribution: {},
      dailyAppointments: {},
    };
  }
}
