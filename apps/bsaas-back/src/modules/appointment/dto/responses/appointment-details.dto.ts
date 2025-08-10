import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '@shared/enums/appointment-status.enum';

class CustomerDto {
  @ApiProperty({ 
    description: 'Customer ID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id!: string;

  @ApiProperty({ 
    description: 'Customer name',
    example: 'John Doe'
  })
  name!: string;

  @ApiProperty({ 
    description: 'Customer email',
    example: 'john.doe@example.com'
  })
  email!: string;

  @ApiPropertyOptional({ 
    description: 'Customer phone number',
    example: '+1234567890',
    nullable: true
  })
  phone: string | null = null;
}

class StaffDto {
  @ApiProperty({ 
    description: 'Staff member ID',
    format: 'uuid',
    example: '223e4567-e89b-12d3-a456-426614174000'
  })
  id!: string;

  @ApiProperty({ 
    description: 'Staff member name',
    example: 'Jane Smith'
  })
  name!: string;

  @ApiPropertyOptional({ 
    description: 'Staff member position',
    example: 'Senior Stylist',
    nullable: true
  })
  position: string | null = null;
}

class ServiceDto {
  @ApiProperty({ 
    description: 'Service ID',
    format: 'uuid',
    example: '323e4567-e89b-12d3-a456-426614174000'
  })
  id!: string;

  @ApiProperty({ 
    description: 'Service name',
    example: 'Haircut and Styling'
  })
  name!: string;

  @ApiProperty({ 
    description: 'Service duration in minutes',
    example: 60
  })
  duration!: number;

  @ApiProperty({ 
    description: 'Service price',
    example: 75.50
  })
  price!: number;
}

class SalonDto {
  @ApiProperty({ 
    description: 'Salon ID',
    format: 'uuid',
    example: '423e4567-e89b-12d3-a456-426614174000'
  })
  id!: string;

  @ApiProperty({ 
    description: 'Salon name',
    example: 'Elegant Cuts'
  })
  name!: string;

  @ApiPropertyOptional({ 
    description: 'Salon address',
    example: '123 Beauty St, City',
    nullable: true
  })
  address: string | null = null;
}

/**
 * Detailed appointment response DTO with related entities
 */
export class AppointmentDetailsDto {
  @ApiProperty({ 
    description: 'Appointment ID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id!: string;

  @ApiProperty({ 
    description: 'Title of the appointment',
    example: 'Haircut and Styling'
  })
  title!: string;

  @ApiPropertyOptional({ 
    description: 'Description of the appointment',
    example: 'Regular haircut with styling and blow dry',
    nullable: true
  })
  description: string | null = null;

  @ApiProperty({ 
    description: 'ISO 8601 timestamp when the appointment starts',
    example: '2023-12-01T10:00:00Z'
  })
  startTime!: string;

  @ApiProperty({ 
    description: 'ISO 8601 timestamp when the appointment ends',
    example: '2023-12-01T11:00:00Z'
  })
  endTime!: string;

  @ApiProperty({ 
    enum: AppointmentStatus, 
    description: 'Current status of the appointment',
    example: AppointmentStatus.CONFIRMED
  })
  status!: AppointmentStatus;

  @ApiProperty({ 
    description: 'Duration of the appointment in minutes',
    example: 60
  })
  duration!: number;

  @ApiProperty({ 
    description: 'Price of the appointment',
    example: 75.50
  })
  price!: number;

  @ApiPropertyOptional({ 
    description: 'Additional notes about the appointment',
    example: 'Customer prefers side part',
    nullable: true
  })
  notes: string | null = null;

  @ApiProperty({ 
    description: 'Customer details',
    type: CustomerDto
  })
  customer!: CustomerDto;

  @ApiPropertyOptional({ 
    description: 'Assigned staff member details',
    type: StaffDto,
    nullable: true
  })
  staff: StaffDto | null = null;

  @ApiProperty({ 
    description: 'Service details',
    type: ServiceDto
  })
  service!: ServiceDto;

  @ApiProperty({ 
    description: 'Salon details',
    type: SalonDto
  })
  salon!: SalonDto;

  @ApiProperty({ 
    description: 'ISO 8601 timestamp when the appointment was created',
    example: '2023-11-20T15:30:00Z'
  })
  createdAt!: string;

  @ApiProperty({ 
    description: 'ISO 8601 timestamp when the appointment was last updated',
    example: '2023-11-25T09:15:00Z'
  })
  updatedAt!: string;
}
