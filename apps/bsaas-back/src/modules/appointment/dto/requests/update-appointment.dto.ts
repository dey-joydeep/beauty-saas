import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { AppointmentStatus } from '../base-appointment.dto';

/**
 * DTO for updating an existing appointment
 */
export class UpdateAppointmentDto {
  @ApiPropertyOptional({ 
    description: 'ID of the staff member to assign to the appointment',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true
  })
  @IsUUID()
  @IsOptional()
  staffId?: string | null;

  @ApiPropertyOptional({ 
    enum: AppointmentStatus, 
    description: 'New status of the appointment',
    example: AppointmentStatus.BOOKED
  })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiPropertyOptional({ 
    description: 'New scheduled start time of the appointment',
    example: '2023-12-01T10:30:00Z'
  })
  @IsDateString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({ 
    description: 'New scheduled end time of the appointment',
    example: '2023-12-01T11:30:00Z'
  })
  @IsDateString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({ 
    description: 'Additional notes or updates about the appointment',
    example: 'Customer requested to reschedule'
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
