import {
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  Param,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../core/auth/guards/roles.guard';
import { AppointmentsFilterDto } from '../dto/appointment-filter.dto';
import { AppointmentDto } from '../dto/appointment.dto';
import { AppointmentsOverviewDto } from '../dto/appointments-overview.dto';
import { AppUserRole } from '../models/user-params.model';
import { AppointmentService } from '../services/appointment.service';

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@ApiBearerAuth()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get('overview')
  @Roles(AppUserRole.ADMIN, AppUserRole.OWNER, AppUserRole.STAFF, AppUserRole.CUSTOMER)
  @ApiOperation({ 
    summary: 'Get appointments overview with statistics',
    description: 'Returns an overview of appointments with statistics based on the provided filters.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved appointments overview',
    type: AppointmentsOverviewDto,
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'User is not authenticated' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'User does not have permission to access this resource' 
  })
  @ApiQuery({ 
    name: 'filters', 
    type: AppointmentsFilterDto,
    required: false,
    description: 'Filter criteria for appointments' 
  })
  async getAppointmentsOverview(
    @Request() req: { user: { id: string; role: AppUserRole } },
    @Query() filters: AppointmentsFilterDto,
  ): Promise<AppointmentsOverviewDto> {
    // Create a new instance of AppointmentsFilterDto with the query parameters
    const filterDto = AppointmentsFilterDto.create({
      ...filters,
      page: filters.page ? Number(filters.page) : undefined,
    });

    return this.appointmentService.getAppointmentsOverview(filterDto, req.user.id);
  }

  @Get('user')
  @Roles(AppUserRole.ADMIN, AppUserRole.OWNER, AppUserRole.STAFF, AppUserRole.CUSTOMER)
  @ApiOperation({ 
    summary: 'Get appointments for the authenticated user',
    description: 'Retrieves a list of appointments for the authenticated user. Admin/owner/staff can access any user\'s appointments by providing a userId query parameter.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved user appointments',
    type: [AppointmentDto],
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'User is not authenticated' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'User does not have permission to access these appointments' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  @ApiQuery({ 
    name: 'filters', 
    type: AppointmentsFilterDto,
    required: false,
    description: 'Optional filter criteria for appointments' 
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Optional user ID to get appointments for (admin/owner/staff only)'
  })
  async getUserAppointments(
    @Request() req: { user: { id: string; role: AppUserRole } },
    @Query('userId') targetUserId?: string,
    @Query() filters: AppointmentsFilterDto = AppointmentsFilterDto.create({}),
  ): Promise<AppointmentDto[]> {
    // If no targetUserId is provided, default to the current user's ID
    const userId = targetUserId || req.user.id;

    // If a user is trying to access another user's appointments, check permissions
    if (userId !== req.user.id && 
        !([AppUserRole.ADMIN, AppUserRole.OWNER, AppUserRole.STAFF] as string[]).includes(req.user.role)) {
      throw new ForbiddenException('You do not have permission to view these appointments');
    }

    // Ensure we have a properly instantiated DTO
    const filterDto = filters instanceof AppointmentsFilterDto 
      ? filters 
      : AppointmentsFilterDto.create(filters);

    return this.appointmentService.getAppointmentsByUser(userId, filterDto);
  }

  @Get('tenant/:tenantId')
  @Roles(AppUserRole.ADMIN, AppUserRole.OWNER, AppUserRole.STAFF, AppUserRole.CUSTOMER)
  @ApiOperation({ 
    summary: 'Get appointments for a specific tenant',
    description: 'Retrieves a list of appointments for a specific tenant with optional filtering.'
  })
  @ApiParam({ name: 'tenantId', description: 'The ID of the tenant to get appointments for' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved tenant appointments',
    type: [AppointmentDto],
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'User is not authenticated' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'User does not have permission to access this resource' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Tenant not found' 
  })
  async getTenantAppointments(
    @Request() req: { user: { id: string; role: AppUserRole } },
    @Param('tenantId') tenantId: string,
    @Query() filters: AppointmentsFilterDto = AppointmentsFilterDto.create({}),
  ): Promise<AppointmentDto[]> {
    // For customers, only show their own appointments for this tenant
    if (req.user.role === AppUserRole.CUSTOMER) {
      // Create a new filter with the customer's ID and tenant ID
      const customerFilter = AppointmentsFilterDto.create({
        ...filters,
        customerId: req.user.id,
        tenantId: tenantId
      });
      return this.appointmentService.getAppointmentsByUser(req.user.id, customerFilter);
    }
    
    // For admin/owner/staff, show all appointments for the tenant
    const tenantFilter = AppointmentsFilterDto.create({
      ...filters,
      tenantId: tenantId
    });
    return this.appointmentService.getTenantAppointments(tenantId, tenantFilter);
  }

  @Get('eligible-to-review/:tenantId')
  @Roles(AppUserRole.CUSTOMER)
  @ApiOperation({ 
    summary: 'Check if user is eligible to review a tenant',
    description: 'Determines if a user is eligible to leave a review for a specific tenant based on past appointments and existing reviews.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Eligibility status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        eligible: { type: 'boolean', description: 'Whether the user is eligible to review the tenant' },
        message: { type: 'string', description: 'Optional message explaining the eligibility status' },
      },
    },
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'User is not authenticated' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'User does not have permission to access this resource' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User or tenant not found' 
  })
  @ApiParam({ 
    name: 'userId', 
    description: 'ID of the user to check eligibility for',
    type: String,
  })
  @ApiParam({ 
    name: 'tenantId', 
    description: 'ID of the tenant to check review eligibility for',
    type: String,
  })
  async getUserEligibleToReview(
    @Request() req: { user: { id: string; role: AppUserRole } },
    @Param('userId') userId: string,
    @Param('tenantId') tenantId: string,
  ): Promise<{ eligible: boolean; message?: string }> {
    // Only allow users to check their own eligibility or admins to check any user
    if (req.user.role !== AppUserRole.ADMIN && req.user.id !== userId) {
      throw new ForbiddenException('You do not have permission to check review eligibility for this user');
    }

    return this.appointmentService.checkUserEligibleToReview(userId, tenantId);
  }

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
