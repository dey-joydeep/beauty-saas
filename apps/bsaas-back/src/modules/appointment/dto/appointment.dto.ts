import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '@shared/enums';

/**
 * DTO representing an appointment
 */
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

  @ApiProperty({ description: 'ID of the customer' })
  customerId!: string;

  @ApiProperty({ description: 'Name of the customer' })
  customerName!: string;

  @ApiProperty({ description: 'Email of the customer' })
  customerEmail!: string;

  @ApiProperty({ 
    description: 'ID of the staff member assigned to the appointment',
    nullable: true 
  })
  staffId!: string | null;

  @ApiProperty({ description: 'Name of the staff member' })
  staffName!: string;

  @ApiProperty({ description: 'ID of the service' })
  serviceId!: string;

  @ApiProperty({ description: 'Name of the service' })
  serviceName!: string;

  @ApiProperty({ description: 'Duration of the appointment in minutes' })
  duration!: number;

  @ApiProperty({ description: 'Price of the appointment' })
  price!: number;

  @ApiProperty({ description: 'ID of the salon' })
  salonId!: string;

  @ApiProperty({ description: 'Name of the salon' })
  salonName!: string;

  @ApiProperty({ description: 'ISO 8601 timestamp when the appointment was created' })
  createdAt!: string;

  @ApiProperty({ description: 'ISO 8601 timestamp when the appointment was last updated' })
  updatedAt!: string;

  /**
   * Create a new instance from a Prisma appointment
   * @param appointment The Prisma appointment object
   * @returns A new AppointmentDto instance
   */
  static fromPrisma(appointment: any): AppointmentDto {
    const dto = new AppointmentDto();
    dto.id = appointment.id;
    dto.title = appointment.title;
    dto.description = appointment.description;
    dto.startTime = appointment.startTime.toISOString();
    dto.endTime = appointment.endTime.toISOString();
    dto.status = appointment.status as AppointmentStatus;
    dto.customerId = appointment.customerId;
    dto.customerName = appointment.customer?.name || '';
    dto.customerEmail = appointment.customer?.email || '';
    dto.staffId = appointment.staffId;
    dto.staffName = appointment.staff?.user?.name || '';
    dto.serviceId = appointment.serviceId;
    dto.serviceName = appointment.service?.name || '';
    dto.duration = appointment.duration;
    dto.price = appointment.price;
    dto.salonId = appointment.salonId;
    dto.salonName = appointment.salon?.name || '';
    dto.createdAt = appointment.createdAt.toISOString();
    dto.updatedAt = appointment.updatedAt.toISOString();
    return dto;
  }
}
