import { Controller, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AppointmentService } from './appointment.service';

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@ApiBearerAuth()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  // @Get('overview')
  // @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.STAFF)
  // @ApiOperation({ summary: 'Get appointments overview with statistics' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Returns appointments overview with statistics',
  //   type: AppointmentsOverviewDto,
  // })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // @ApiResponse({ status: 403, description: 'Forbidden' })
  // async getAppointmentsOverview(
  //   @Query() filters: AppointmentsFilterDto,
  // ): Promise<AppointmentsOverviewDto> {
  //   return this.appointmentService.getAppointmentsOverview(filters);
  // }

  // @Get('user/:userId')
  // @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.STAFF, UserRole.CUSTOMER)
  // @ApiOperation({ summary: 'Get appointments for a user' })
  // @ApiResponse({ status: 200, description: 'Returns user appointments' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // @ApiResponse({ status: 403, description: 'Forbidden' })
  // async getUserAppointments(@Param('userId') userId: string) {
  //   return this.appointmentService.getAppointmentsByUser(userId);
  // }

  // @Get('salon/:salonId')
  // @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.STAFF)
  // @ApiOperation({ summary: 'Get appointments for a salon' })
  // @ApiResponse({ status: 200, description: 'Returns salon appointments' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // @ApiResponse({ status: 403, description: 'Forbidden' })
  // async getSalonAppointments(
  //   @Param('salonId') salonId: string,
  //   @Query() filters: AppointmentsFilterDto
  // ): Promise<AppointmentWithDetails[]> {
  //   return this.appointmentService.getAppointmentsBySalon(salonId, filters);
  // }

  // @Get('user/:userId/salon/:salonId/eligible-to-review')
  // @Roles(UserRole.CUSTOMER)
  // @ApiOperation({ summary: 'Check if user is eligible to review a salon' })
  // @ApiResponse({ status: 200, description: 'Returns eligibility status' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // @ApiResponse({ status: 403, description: 'Forbidden' })
  // async checkUserEligibleToReview(
  //   @Param('userId') userId: string,
  //   @Param('salonId') salonId: string,
  // ): Promise<{ eligible: boolean }> {
  //   const isEligible = await this.appointmentService.isUserEligibleToReview(userId, salonId);
  //   return { eligible: isEligible };
  // }

  // @Post()
  // @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.STAFF, UserRole.CUSTOMER)
  // @ApiOperation({ summary: 'Create a new appointment' })
  // @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  // @ApiResponse({ status: 400, description: 'Bad request' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // @ApiResponse({ status: 403, description: 'Forbidden' })
  // async createAppointment(
  //   @Body() createAppointmentDto: CreateAppointmentDto
  // ): Promise<AppointmentWithDetails> {
  //   try {
  //     return await this.appointmentService.createAppointment(createAppointmentDto);
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       throw new BadRequestException(error.message);
  //     }
  //     throw error;
  //   }
  // }
}
