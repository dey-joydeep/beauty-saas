import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export enum AppointmentStatus {
  BOOKED = 'booked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Base DTO for appointment-related operations
 */
export class BaseAppointmentDto {
  @ApiProperty({ 
    description: 'Title of the appointment',
    example: 'Haircut and Styling'
  })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ 
    description: 'Optional description of the appointment',
    example: 'Regular haircut with styling and blow dry',
    nullable: true
  })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({ 
    description: 'ISO 8601 timestamp when the appointment starts',
    example: '2023-12-01T10:00:00Z'
  })
  @IsDateString()
  startTime!: string;

  @ApiProperty({ 
    description: 'ISO 8601 timestamp when the appointment ends',
    example: '2023-12-01T11:00:00Z'
  })
  @IsDateString()
  endTime!: string;

  @ApiProperty({ 
    enum: AppointmentStatus, 
    description: 'Current status of the appointment',
    example: AppointmentStatus.BOOKED
  })
  @IsEnum(AppointmentStatus, { message: 'Invalid appointment status' })
  @Transform(({ value }) => value?.toUpperCase())
  status!: AppointmentStatus;

  @ApiProperty({ 
    description: 'ID of the customer',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID('4', { message: 'Invalid customer ID format' })
  customerId!: string;

  @ApiPropertyOptional({ 
    description: 'ID of the staff member assigned to the appointment',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174001',
    nullable: true
  })
  @IsUUID()
  @IsOptional()
  staffId?: string | null;

  @ApiProperty({ 
    description: 'ID of the service',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174002'
  })
  @IsUUID()
  serviceId!: string;

  @ApiPropertyOptional({ 
    description: 'Duration of the appointment in minutes',
    example: 60,
    type: Number
  })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ 
    description: 'Price of the appointment',
    example: 100.50,
    type: Number
  })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ 
    description: 'ID of the salon',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174003'
  })
  @IsUUID()
  salonId!: string;
}
