import { ApiProperty } from '@nestjs/swagger';
import { AppointmentDto } from './appointment.dto';
import { AppointmentStatus } from '@shared/enums/appointment-status.enum';

/**
 * DTO representing an overview of appointments with statistics
 */
export class AppointmentsOverviewDto {
  @ApiProperty({ description: 'Total number of appointments' })
  totalAppointments!: number;

  @ApiProperty({ description: 'Number of booked appointments' })
  bookedAppointments!: number;

  @ApiProperty({ description: 'Number of completed appointments' })
  completedAppointments!: number;

  @ApiProperty({ description: 'Number of cancelled appointments' })
  cancelledAppointments!: number;

  @ApiProperty({ description: 'Total revenue from all appointments' })
  totalRevenue!: number;

  @ApiProperty({ description: 'Average duration of appointments in minutes' })
  averageDuration!: number;

  @ApiProperty({ 
    type: [AppointmentDto],
    description: 'List of upcoming appointments' 
  })
  upcomingAppointments!: AppointmentDto[];

  @ApiProperty({ 
    type: [AppointmentDto],
    description: 'List of recent appointments' 
  })
  recentAppointments!: AppointmentDto[];

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    description: 'Distribution of appointments by status',
    example: {
      [AppointmentStatus.PENDING]: 5,
      [AppointmentStatus.CONFIRMED]: 3,
      [AppointmentStatus.COMPLETED]: 10,
      [AppointmentStatus.CANCELLED]: 2,
      [AppointmentStatus.NOSHOW]: 1,
      [AppointmentStatus.RESCHEDULED]: 0
    }
  })
  statusDistribution!: Record<AppointmentStatus, number>;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    description: 'Number of appointments per day',
    example: {
      '2023-01-01': 5,
      '2023-01-02': 3,
      '2023-01-03': 7
    }
  })
  dailyAppointments!: Record<string, number>;

  /**
   * Create a new instance with default values
   */
  constructor() {
    this.totalAppointments = 0;
    this.bookedAppointments = 0;
    this.completedAppointments = 0;
    this.cancelledAppointments = 0;
    this.totalRevenue = 0;
    this.averageDuration = 0;
    this.upcomingAppointments = [];
    this.recentAppointments = [];
    this.statusDistribution = Object.values(AppointmentStatus).reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {} as Record<AppointmentStatus, number>);
    this.dailyAppointments = {};
  }

  /**
   * Create a new instance from raw data
   * @param data The raw data to create from
   * @returns A new AppointmentsOverviewDto instance
   */
  static fromRawData(data: any): AppointmentsOverviewDto {
    const overview = new AppointmentsOverviewDto();
    
    if (!data) return overview;

    overview.totalAppointments = data.totalAppointments || 0;
    overview.bookedAppointments = data.bookedAppointments || 0;
    overview.completedAppointments = data.completedAppointments || 0;
    overview.cancelledAppointments = data.cancelledAppointments || 0;
    overview.totalRevenue = data.totalRevenue || 0;
    overview.averageDuration = data.averageDuration || 0;
    
    if (Array.isArray(data.upcomingAppointments)) {
      overview.upcomingAppointments = data.upcomingAppointments.map((appt: any) => 
        appt instanceof AppointmentDto ? appt : AppointmentDto.fromPrisma(appt)
      );
    }
    
    if (Array.isArray(data.recentAppointments)) {
      overview.recentAppointments = data.recentAppointments.map((appt: any) => 
        appt instanceof AppointmentDto ? appt : AppointmentDto.fromPrisma(appt)
      );
    }
    
    if (data.statusDistribution) {
      overview.statusDistribution = { ...overview.statusDistribution, ...data.statusDistribution };
    }
    
    if (data.dailyAppointments) {
      overview.dailyAppointments = { ...data.dailyAppointments };
    }
    
    return overview;
  }
}
