import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IRequestWithUser } from '../interfaces/user-request.interface';
import { AppUserRole } from '@shared/types/user.types';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { Roles } from '../../../core/auth/guards/roles.guard';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserService } from '../services/user.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @Roles(AppUserRole.ADMIN)
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getUserStats(
    @Query('tenant_id') tenantId: string,
    @Req() req: IRequestWithUser,
  ) {
    try {
      // The JwtAuthGuard and RolesGuard already verify the user's authentication and authorization
      // For now, we'll return a simple object since getUserStats is not implemented
      return {
        totalUsers: 0,
        activeUsers: 0,
        tenantId: tenantId || 'all',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to get user statistics');
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(AppUserRole.ADMIN, AppUserRole.OWNER, AppUserRole.STAFF)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseInterceptors(ClassSerializerInterceptor)
  async getUsers(
    @Query('tenant_id') tenantId?: string,
    @Req() req?: IRequestWithUser,
  ) {
    try {
      // If user is not an admin, they can only see users from their own tenant
      if (
        !req?.user?.roles.some((r) => r.name === AppUserRole.ADMIN) &&
        tenantId &&
        tenantId !== req?.user?.tenantId
      ) {
        throw new ForbiddenException(
          'You do not have permission to view users from this tenant',
        );
      }

      // If no tenant ID is provided and user is not an admin, use the user's tenant ID
      if (
        !tenantId &&
        req?.user &&
        !req.user.roles.some((r) => r.name === AppUserRole.ADMIN)
      ) {
        tenantId = req.user.tenantId || undefined;
      }

      // Pass the where clause directly to getUsers
      const where = tenantId ? { tenantId } : undefined;
      return await this.userService.getUsers(where);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.createUser(createUserDto);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        tenantId: user.tenantId,
        roles: user.roles,
        isVerified: user.isVerified,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(AppUserRole.ADMIN, AppUserRole.OWNER)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseInterceptors(ClassSerializerInterceptor)
  async create(
    @Body() createUserDto: CreateUserDto,
    @Req() req: IRequestWithUser,
  ) {
    try {
      // Only allow ADMIN to create users with ADMIN role
      // OWNER can only create CUSTOMER and STAFF users
      if (
        !req.user.roles.some((r) => r.name === AppUserRole.ADMIN) &&
        createUserDto.role === AppUserRole.ADMIN
      ) {
        throw new ForbiddenException(
          'You do not have permission to create users with ADMIN role',
        );
      }

      // Set the tenant ID from the current user if not provided
      if (!createUserDto.tenantId) {
        createUserDto.tenantId = req.user.tenantId || null;
      }

      return await this.userService.createUser(createUserDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const updatedUser = await this.userService.updateUser(id, updateUserDto);
      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        tenantId: updatedUser.tenantId,
        roles: updatedUser.roles,
        isVerified: updatedUser.isVerified,
        phone: updatedUser.phone,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      } else if (error instanceof ConflictException) {
        throw new ConflictException('Email already exists');
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(AppUserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteUser(@Param('id') id: string) {
    try {
      await this.userService.deleteUser(id);
      return;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async login(@Body() loginUserDto: LoginUserDto) {
    try {
      const { email, password } = loginUserDto;
      
      // Use the service to handle login and token generation
      const loginResult = await this.userService.login(loginUserDto);
      
      // Get the full user with roles
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Return user data without sensitive information
      const userResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles ? user.roles.map((r: any) => r.role?.name || r) : [],
        tenantId: user.tenantId,
        isVerified: user.isVerified,
        isActive: user.isActive,
        phone: user.phone,
      };

      return {
        accessToken: loginResult.accessToken,
        user: userResponse,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Login failed');
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getCurrentUser(@Req() req: IRequestWithUser) {
    try {
      const user = await this.userService.getUserById(req.user.id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        tenantId: user.tenantId,
        roles: user.roles ? user.roles.map((r: any) => r.role?.name || r) : [],
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get user profile');
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async logout() {
    // In a stateless JWT system, logout is handled client-side by removing the token
    // This endpoint is provided for consistency and future extensibility
    return { message: 'Logout successful' };
  }
}
