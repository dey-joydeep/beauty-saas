import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '@shared/enums/appointment-status.enum';

class StatusCountDto {
  @ApiProperty({
    description: 'Appointment status',
    enum: AppointmentStatus,
    required: true
  })
  status!: AppointmentStatus;

  @ApiProperty({
    description: 'Number of appointments with this status',
    example: 10,
    required: true
  })
  count!: number;

  @ApiProperty({
    description: 'Percentage of total appointments',
    example: 25.5,
    required: true
  })
  percentage!: number;
}

class TimeSlotDto {
  @ApiProperty({
    description: 'Time slot identifier (e.g., hour of day, day of week)',
    example: '10:00 AM',
    required: true
  })
  slot!: string;

  @ApiProperty({
    description: 'Number of appointments in this time slot',
    example: 5,
    required: true
  })
  count!: number;
}

class RevenueMetricsDto {
  @ApiProperty({
    description: 'Total revenue from all appointments',
    example: 12500.75,
    required: true
  })
  totalRevenue!: number;

  @ApiProperty({
    description: 'Average revenue per appointment',
    example: 85.25,
    required: true
  })
  averageRevenue!: number;

  @ApiProperty({
    description: 'Percentage change from previous period',
    example: 12.5,
    required: false
  })
  growthRate?: number;

  @ApiProperty({
    description: 'Revenue by payment method',
    type: 'object',
    additionalProperties: { type: 'number' },
    example: { 'CREDIT_CARD': 7500.50, 'CASH': 5000.25 },
    required: true
  })
  byPaymentMethod!: Record<string, number>;
}

class ServiceMetricsDto {
  @ApiProperty({
    description: 'Service ID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true
  })
  serviceId!: string;

  @ApiProperty({
    description: 'Service name',
    example: 'Haircut and Styling',
    required: true
  })
  serviceName!: string;

  @ApiProperty({
    description: 'Number of appointments for this service',
    example: 25,
    required: true
  })
  appointmentCount!: number;

  @ApiProperty({
    description: 'Total revenue from this service',
    example: 1875.50,
    required: true
  })
  totalRevenue!: number;

  @ApiProperty({
    description: 'Percentage of total appointments',
    example: 35.7,
    required: true
  })
  percentage!: number;
}

/**
 * DTO for appointment statistics and metrics
 */
export class AppointmentStatsDto {
  @ApiProperty({
    description: 'Total number of appointments',
    example: 150,
    required: true
  })
  totalAppointments!: number;

  @ApiProperty({
    description: 'Appointment counts by status',
    type: [StatusCountDto],
    required: true
  })
  statusDistribution!: StatusCountDto[];

  @ApiProperty({
    description: 'Appointment distribution by time slots',
    type: [TimeSlotDto],
    required: true
  })
  timeDistribution!: TimeSlotDto[];

  @ApiProperty({
    description: 'Revenue metrics and statistics',
    required: true
  })
  revenue!: RevenueMetricsDto;

  @ApiProperty({
    description: 'Top performing services',
    type: [ServiceMetricsDto],
    required: true
  })
  topServices!: ServiceMetricsDto[];

  @ApiProperty({
    description: 'Date range start for the statistics',
    example: '2023-01-01T00:00:00Z',
    required: true
  })
  startDate!: string;

  @ApiProperty({
    description: 'Date range end for the statistics',
    example: '2023-12-31T23:59:59Z',
    required: true
  })
  endDate!: string;
}
