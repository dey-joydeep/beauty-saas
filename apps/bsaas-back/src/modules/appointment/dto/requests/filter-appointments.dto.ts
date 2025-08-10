import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { AppointmentStatus } from '@shared/enums/appointment-status.enum';

/**
 * DTO for filtering and paginating appointments
 */
export class FilterAppointmentsDto {
  @ApiPropertyOptional({ 
    description: 'Filter by start date (ISO 8601)',
    example: '2023-01-01T00:00:00Z'
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by end date (ISO 8601)',
    example: '2023-12-31T23:59:59Z'
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ 
    enum: AppointmentStatus,
    description: 'Filter by appointment status'
  })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiPropertyOptional({ 
    description: 'Filter by customer ID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by staff member ID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsUUID()
  @IsOptional()
  staffId?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by service ID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174002'
  })
  @IsUUID()
  @IsOptional()
  serviceId?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by salon ID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174003'
  })
  @IsUUID()
  @IsOptional()
  salonId?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by tenant ID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174004'
  })
  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @ApiPropertyOptional({ 
    description: 'Search by customer name, email, or notes',
    example: 'john'
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ 
    description: 'Page number for pagination (1-based)',
    default: 1,
    minimum: 1
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Number of items per page',
    default: 10,
    minimum: 1,
    maximum: 100
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort field (createdAt, startTime, endTime, status)',
    enum: ['createdAt', 'startTime', 'endTime', 'status'],
    default: 'startTime'
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'startTime';

  @ApiPropertyOptional({
    description: 'Sort order (asc or desc)',
    enum: ['asc', 'desc'],
    default: 'asc'
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  sortOrder?: 'asc' | 'desc' = 'asc';
}
