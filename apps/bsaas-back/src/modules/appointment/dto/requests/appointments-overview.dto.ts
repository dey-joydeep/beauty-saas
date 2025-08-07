import { IsOptional, IsEnum, IsNumber, IsDateString, IsUUID, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '@shared';

/**
 * DTO for filtering appointments
 */
/**
 * DTO for filtering appointments
 */
export class AppointmentsFilterDto {
  @ApiPropertyOptional({ 
    type: String, 
    format: 'date-time', 
    description: 'Start date for filtering appointments' 
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ 
    type: String, 
    format: 'date-time', 
    description: 'End date for filtering appointments' 
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ 
    enum: AppointmentStatus, 
    enumName: 'AppointmentStatus',
    description: 'Filter by appointment status' 
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({ 
    type: String, 
    format: 'uuid',
    description: 'Filter by salon ID' 
  })
  @IsOptional()
  @IsUUID()
  salonId?: string;

  @ApiPropertyOptional({ 
    type: String, 
    format: 'uuid',
    description: 'Filter by staff member ID' 
  })
  @IsOptional()
  @IsUUID()
  staffId?: string;

  @ApiPropertyOptional({ 
    type: String, 
    format: 'uuid',
    description: 'Filter by customer ID' 
  })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ 
    type: String, 
    format: 'uuid',
    description: 'Filter by service ID' 
  })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @ApiPropertyOptional({ 
    type: Number, 
    minimum: 1,
    maximum: 100,
    default: 10,
    description: 'Maximum number of results to return' 
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  limit: number = 10;

  @ApiPropertyOptional({ 
    type: Number, 
    minimum: 0,
    default: 0,
    description: 'Number of results to skip' 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  offset: number = 0;

  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    default: 1,
    description: 'Page number for pagination (1-based)'
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  page?: number = 1;

  @ApiPropertyOptional({ 
    type: String, 
    format: 'uuid',
    description: 'ID of the tenant (organization)'
  })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  /**
   * Converts the filter to a Prisma query object
   * @returns Object containing where clause and pagination parameters
   */
  toPrismaFilter(): { where: Record<string, unknown>; skip: number; take: number } {
    const where: Record<string, unknown> = {};

    // Date range filter
    if (this.startDate || this.endDate) {
      const dateFilter: Record<string, unknown> = {};
      
      if (this.startDate) {
        dateFilter['gte'] = new Date(this.startDate);
      }
      
      if (this.endDate) {
        dateFilter['lte'] = new Date(this.endDate);
      }
      
      where['startTime'] = dateFilter;
    }

    // Status filter
    if (this.status) {
      where['status'] = this.status;
    }

    // ID filters
    if (this.salonId) where['salonId'] = this.salonId;
    if (this.staffId) where['staffId'] = this.staffId;
    if (this.customerId) where['customerId'] = this.customerId;
    if (this.serviceId) where['serviceId'] = this.serviceId;
    if (this.tenantId) where['tenantId'] = this.tenantId;

    return {
      where,
      skip: this.offset,
      take: this.limit,
    };
  }

  /**
   * Creates a new instance of AppointmentsFilterDto with default values
   * @param filters Partial filter values to override defaults
   * @returns New AppointmentsFilterDto instance
   */
  static create(filters: Partial<AppointmentsFilterDto> = {}): AppointmentsFilterDto {
    const dto = new AppointmentsFilterDto();
    return Object.assign(dto, {
      limit: 10,
      offset: 0,
      page: 1,
      ...filters
    });
  }
}

/**
 * Type guard to check if a value is a valid AppointmentStatus
 * @param status The value to check
 * @returns boolean indicating if the value is a valid AppointmentStatus
 */
const isAppointmentStatus = (status: string): status is AppointmentStatus => {
  return Object.values(AppointmentStatus).includes(status as AppointmentStatus);
};

export class AppointmentDto {
  @ApiProperty({ description: 'Unique identifier for the appointment' })
  id!: string;

  @ApiProperty({ description: 'Title of the appointment' })
  title!: string;

  @ApiPropertyOptional({ description: 'Optional description of the appointment' })
  description?: string;

  @ApiProperty({ description: 'ISO 8601 timestamp when the appointment starts' })
  startTime!: string;

  @ApiProperty({ description: 'ISO 8601 timestamp when the appointment ends' })
  endTime!: string;

  @ApiProperty({ enum: AppointmentStatus, description: 'Current status of the appointment' })
  status!: AppointmentStatus;

  /**
   * ID of the customer who booked the appointment
   */
  customerId!: string;

  /**
   * Name of the customer
   */
  customerName!: string;

  /**
   * Email of the customer
   */
  customerEmail!: string;

  /**
   * ID of the staff member assigned to the appointment
   */
  staffId!: string | null;

  /**
   * Name of the assigned staff member
   */
  staffName!: string;

  /**
   * ID of the service
   */
  serviceId!: string;

  /**
   * Name of the service
   */
  serviceName!: string;

  /**
   * Duration of the service in minutes
   */
  duration!: number;

  /**
   * Price of the service
   */
  price!: number;

  /**
   * ID of the salon
   */
  salonId!: string;

  /**
   * Name of the salon
   */
  salonName!: string;

  /**
   * Date and time when the appointment was created (ISO string)
   */
  createdAt!: string;

  /**
   * Date and time when the appointment was last updated (ISO string)
   */
  updatedAt!: string;
}

export class AppointmentsOverviewDto {
  /**
   * Total number of appointments
   */
  totalAppointments!: number;

  /**
   * Number of booked appointments
   * @example 15
   */
  bookedAppointments!: number;

  /**
   * Number of completed appointments
   * @example 42
   */
  completedAppointments!: number;

  /**
   * Number of cancelled appointments
   * @example 3
   */
  cancelledAppointments!: number;

  /**
   * Total revenue from completed appointments
   */
  totalRevenue!: number;

  /**
   * Average appointment duration in minutes
   */
  averageDuration!: number;

  /**
   * List of upcoming appointments (max 10)
   */
  upcomingAppointments!: AppointmentDto[];

  /**
   * List of recent appointments (max 5)
   */
  recentAppointments!: AppointmentDto[];

  /**
   * Appointment count by status
   * @example
   * {
   *   'booked': 15,
   *   'completed': 42,
   *   'cancelled': 3
   * }
   */
  statusDistribution!: Record<AppointmentStatus, number>;

  /**
   * Appointment count by date (for the last 30 days)
   * @example
   * {
   *   '2023-01-01': 5,
   *   '2023-01-02': 3,
   *   '2023-01-03': 7
   * }
   */
  dailyAppointments!: Record<string, number>;
}
