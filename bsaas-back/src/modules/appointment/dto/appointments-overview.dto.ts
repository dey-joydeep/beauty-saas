import { IsOptional, IsDateString, IsEnum, IsString, IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Import the Prisma-generated enum type and re-export it
import { AppointmentStatus } from '@prisma/client';

export { AppointmentStatus };

// Type guard for AppointmentStatus
export const isAppointmentStatus = (status: string): status is AppointmentStatus => {
  return Object.values(AppointmentStatus).includes(status as AppointmentStatus);
};

export class AppointmentsFilterDto {
  @ApiPropertyOptional({
    description: 'Start date for filtering appointments (ISO date string)',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering appointments (ISO date string)',
    example: '2023-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    enum: AppointmentStatus,
    description: 'Filter by appointment status',
    example: 'booked',
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    description: 'Filter by salon ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  salonId?: string;

  @ApiPropertyOptional({
    description: 'Filter by staff member ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  staffId?: string;

  @ApiPropertyOptional({
    description: 'Filter by customer ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({
    description: 'Filter by tenant ID',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiPropertyOptional({
    description: 'ID of the service to filter appointments by',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  serviceId?: string;
}

export class AppointmentDto {
  @ApiProperty({ description: 'Unique identifier of the appointment' })
  id!: string;

  @ApiProperty({ description: 'Title or name of the appointment' })
  title!: string;

  @ApiProperty({ description: 'Description of the appointment', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Start date and time of the appointment (ISO string)' })
  startTime!: string;

  @ApiProperty({ description: 'End date and time of the appointment (ISO string)' })
  endTime!: string;

  @ApiProperty({ enum: AppointmentStatus, description: 'Current status of the appointment' })
  status!: AppointmentStatus;

  @ApiProperty({ description: 'ID of the customer' })
  customerId!: string;

  @ApiProperty({ description: 'Name of the customer' })
  customerName!: string;

  @ApiProperty({ description: 'Email of the customer' })
  customerEmail!: string;

  @ApiProperty({ description: 'ID of the assigned staff member' })
  staffId!: string;

  @ApiProperty({ description: 'Name of the assigned staff member' })
  staffName!: string;

  @ApiProperty({ description: 'ID of the service' })
  serviceId!: string;

  @ApiProperty({ description: 'Name of the service' })
  serviceName!: string;

  @ApiProperty({ description: 'Duration of the service in minutes' })
  duration!: number;

  @ApiProperty({ description: 'Price of the service' })
  price!: number;

  @ApiProperty({ description: 'ID of the salon' })
  salonId!: string;

  @ApiProperty({ description: 'Name of the salon' })
  salonName!: string;

  @ApiProperty({ description: 'Date and time when the appointment was created (ISO string)' })
  createdAt!: string;

  @ApiProperty({ description: 'Date and time when the appointment was last updated (ISO string)' })
  updatedAt!: string;
}

export class AppointmentsOverviewDto {
  @ApiProperty({ description: 'Total number of appointments' })
  totalAppointments!: number;

  @ApiProperty({ 
    description: 'Number of booked appointments',
    example: 15
  })
  bookedAppointments!: number;

  @ApiProperty({ 
    description: 'Number of completed appointments',
    example: 42
  })
  completedAppointments!: number;

  @ApiProperty({ 
    description: 'Number of cancelled appointments',
    example: 3
  })
  cancelledAppointments!: number;

  @ApiProperty({ description: 'Total revenue from completed appointments' })
  totalRevenue!: number;

  @ApiProperty({ description: 'Average appointment duration in minutes' })
  averageDuration!: number;

  @ApiProperty({
    type: () => [AppointmentDto],
    description: 'List of upcoming appointments (max 10)',
  })
  upcomingAppointments!: AppointmentDto[];

  @ApiProperty({
    type: () => [AppointmentDto],
    description: 'List of recent appointments (max 5)',
  })
  recentAppointments!: AppointmentDto[];

  @ApiProperty({
    description: 'Appointment count by status',
    type: 'object',
    additionalProperties: { type: 'number' },
    example: {
      'booked': 15,
      'completed': 42,
      'cancelled': 3,
    },
  })
  statusDistribution!: Record<AppointmentStatus, number>;

  @ApiProperty({
    description: 'Appointment count by date (for the last 30 days)',
    type: 'object',
    additionalProperties: { type: 'number' },
    example: {
      '2023-01-01': 5,
      '2023-01-02': 3,
      '2023-01-03': 7,
    },
  })
  dailyAppointments!: Record<string, number>;
}
