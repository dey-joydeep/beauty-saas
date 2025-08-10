import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { AppointmentStatus } from '../base-appointment.dto';

export class CreateAppointmentServiceDto {
  @ApiProperty({ 
    description: 'ID of the service',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  serviceId!: string;

  @ApiPropertyOptional({ 
    description: 'ID of the staff member assigned to this service',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174001',
    nullable: true
  })
  @IsUUID()
  @IsOptional()
  staffId?: string | null;
}

/**
 * DTO for creating a new appointment
 */
export class CreateAppointmentDto {
  @ApiProperty({ 
    description: 'ID of the customer',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  customerId!: string;

  @ApiProperty({ 
    description: 'ID of the salon',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsUUID()
  salonId!: string;

  @ApiProperty({ 
    type: [CreateAppointmentServiceDto],
    description: 'List of services for the appointment'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAppointmentServiceDto)
  services!: CreateAppointmentServiceDto[];

  @ApiProperty({ 
    description: 'Scheduled start time of the appointment',
    example: '2023-12-01T10:00:00Z'
  })
  @IsDateString()
  startTime!: string;

  @ApiProperty({ 
    description: 'Scheduled end time of the appointment',
    example: '2023-12-01T11:00:00Z'
  })
  @IsDateString()
  endTime!: string;

  @ApiPropertyOptional({ 
    description: 'Initial status of the appointment',
    enum: AppointmentStatus,
    default: AppointmentStatus.BOOKED
  })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiPropertyOptional({ 
    description: 'Additional notes about the appointment',
    example: 'Customer prefers a specific stylist if available'
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'ID of the tenant',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174002'
  })
  @IsUUID()
  @IsOptional()
  tenantId?: string;
}
