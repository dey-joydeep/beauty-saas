import { IsOptional, IsDateString, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NOSHOW = 'NOSHOW',
}

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
    description: 'Status of the appointments to filter by',
    enum: AppointmentStatus,
    example: AppointmentStatus.CONFIRMED,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    description: 'ID of the staff member to filter appointments by',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  staffId?: string;

  @ApiPropertyOptional({
    description: 'ID of the customer to filter appointments by',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({
    description: 'ID of the service to filter appointments by',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  serviceId?: string;
}

export class AppointmentDto {
  @ApiProperty({ description: 'Unique identifier of the appointment' })
  id: string;

  @ApiProperty({ description: 'Title or name of the appointment' })
  title: string;

  @ApiProperty({ description: 'Description of the appointment', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Start date and time of the appointment (ISO string)' })
  startTime: string;

  @ApiProperty({ description: 'End date and time of the appointment (ISO string)' })
  endTime: string;

  @ApiProperty({ enum: AppointmentStatus, description: 'Current status of the appointment' })
  status: AppointmentStatus;

  @ApiProperty({ description: 'ID of the customer' })
  customerId: string;

  @ApiProperty({ description: 'Name of the customer' })
  customerName: string;

  @ApiProperty({ description: 'Email of the customer' })
  customerEmail: string;

  @ApiProperty({ description: 'ID of the assigned staff member' })
  staffId: string;

  @ApiProperty({ description: 'Name of the assigned staff member' })
  staffName: string;

  @ApiProperty({ description: 'ID of the service' })
  serviceId: string;

  @ApiProperty({ description: 'Name of the service' })
  serviceName: string;

  @ApiProperty({ description: 'Duration of the service in minutes' })
  duration: number;

  @ApiProperty({ description: 'Price of the service' })
  price: number;

  @ApiProperty({ description: 'ID of the salon' })
  salonId: string;

  @ApiProperty({ description: 'Name of the salon' })
  salonName: string;

  @ApiProperty({ description: 'Date and time when the appointment was created (ISO string)' })
  createdAt: string;

  @ApiProperty({ description: 'Date and time when the appointment was last updated (ISO string)' })
  updatedAt: string;
}

export class AppointmentsOverviewDto {
  @ApiProperty({ description: 'Total number of appointments' })
  totalAppointments: number;

  @ApiProperty({ description: 'Number of pending appointments' })
  pendingAppointments: number;

  @ApiProperty({ description: 'Number of confirmed appointments' })
  confirmedAppointments: number;

  @ApiProperty({ description: 'Number of completed appointments' })
  completedAppointments: number;

  @ApiProperty({ description: 'Number of cancelled appointments' })
  cancelledAppointments: number;

  @ApiProperty({ description: 'Number of no-show appointments' })
  noShowAppointments: number;

  @ApiProperty({ description: 'Total revenue from completed appointments' })
  totalRevenue: number;

  @ApiProperty({ description: 'Average appointment duration in minutes' })
  averageDuration: number;

  @ApiProperty({
    type: [AppointmentDto],
    description: 'List of upcoming appointments (max 10)',
  })
  upcomingAppointments: AppointmentDto[];

  @ApiProperty({
    type: [AppointmentDto],
    description: 'List of recent appointments (max 5)',
  })
  recentAppointments: AppointmentDto[];

  @ApiProperty({
    description: 'Appointment count by status',
    type: 'object',
    additionalProperties: { type: 'number' },
    example: {
      PENDING: 5,
      CONFIRMED: 10,
      COMPLETED: 25,
      CANCELLED: 3,
      NOSHOW: 2,
    },
  })
  statusDistribution: Record<string, number>;

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
  dailyAppointments: Record<string, number>;
}
