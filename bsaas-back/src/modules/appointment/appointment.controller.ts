import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/user-role.enum';
import { AppointmentsFilterDto, AppointmentsOverviewDto } from './dto/appointments-overview.dto';
import { AppointmentService } from './appointment.service';

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@ApiBearerAuth()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get('overview')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get appointments overview with statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns appointments overview with statistics',
    type: AppointmentsOverviewDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAppointmentsOverview(
    @Query() filters: AppointmentsFilterDto,
  ): Promise<AppointmentsOverviewDto> {
    return this.appointmentService.getAppointmentsOverview(filters);
  }
}
