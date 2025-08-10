import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '../base-appointment.dto';

/**
 * Base response DTO for appointment data
 */
export class AppointmentResponseDto {
  @ApiProperty({ 
    description: 'Unique identifier for the appointment',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true
  })
  id!: string;

  @ApiProperty({ 
    description: 'Title of the appointment',
    example: 'Haircut and Styling',
    required: true
  })
  title!: string;

  @ApiPropertyOptional({ 
    description: 'Description of the appointment',
    example: 'Regular haircut with styling and blow dry',
    nullable: true,
    required: false
  })
  description?: string | null;

  @ApiProperty({ 
    description: 'ISO 8601 timestamp when the appointment starts',
    example: '2023-12-01T10:00:00Z',
    required: true
  })
  startTime!: string;

  @ApiProperty({ 
    description: 'ISO 8601 timestamp when the appointment ends',
    example: '2023-12-01T11:00:00Z',
    required: true
  })
  endTime!: string;

  @ApiProperty({ 
    enum: AppointmentStatus, 
    description: 'Current status of the appointment',
    example: AppointmentStatus.BOOKED,
    required: true
  })
  status!: AppointmentStatus;

  @ApiProperty({ 
    description: 'Duration of the appointment in minutes',
    example: 60,
    required: true
  })
  duration!: number;

  @ApiProperty({ 
    description: 'Price of the appointment',
    example: 75.50,
    required: true
  })
  price!: number;

  @ApiProperty({ 
    description: 'ISO 8601 timestamp when the appointment was created',
    example: '2023-11-20T15:30:00Z',
    required: true
  })
  createdAt!: string;

  @ApiProperty({ 
    description: 'ISO 8601 timestamp when the appointment was last updated',
    example: '2023-11-25T09:15:00Z',
    required: true
  })
  updatedAt!: string;
}
