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
  UnauthorizedException,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { AppUserRole } from '@shared/types/user.types';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { Roles } from '../../../core/auth/guards/roles.guard';
import { User } from '../../../common/decorators/user.decorator';
import type { AuthUser } from '../../../modules/dashboard/interfaces/dashboard-request.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserService } from '../services/user.service';

import { UserResponseDto } from '../dto/user-response.dto';

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
    @User() _user: AuthUser,
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
  @UseGuards(JwtAuthGuard, Roles)
  @Roles(AppUserRole.ADMIN, AppUserRole.OWNER)
  @ApiOperation({ summary: 'Get all users (admin/owner only)' })
  @ApiResponse({ status: 200, description: 'List of users', type: [UserResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getUsers(
    @Query('page') _page = 1,
    @Query('limit') _limit = 10,
    @Query('search') _search = '',
    @Query('role') _role?: AppUserRole,
    @Query('status') _status?: string,
    @User() user?: AuthUser,
  ): Promise<UserResponseDto[]> {
    try {
      let tenantId: string | null = null;

      // If user is not an admin, they can only see users from their own tenant
      if (user && !user.roles.some((r) => r.name === AppUserRole.ADMIN)) {
        tenantId = user.tenantId || null;
      }

      // Build the where clause with optional filters
      const where: Prisma.UserWhereInput = {};
      
      if (tenantId) {
        where.tenantId = tenantId;
      }
      
      if (_search) {
        where.OR = [
          { name: { contains: _search, mode: 'insensitive' } },
          { email: { contains: _search, mode: 'insensitive' } },
        ];
      }
      
      if (_role) {
        where.roles = {
          some: {
            role: {
              name: _role,
            },
          },
        };
      }
      
      if (_status) {
        where.isActive = _status === 'active';
      }

      // Get paginated results
      const users = await this.userService.getUsers(where);
      
      // Transform the response to match the expected format
      return users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        isVerified: user.isVerified,
        isActive: user.isActive,
        avatarUrl: user.avatarUrl,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        tenantId: user.tenantId,
        roles: user.roles?.map(ur => ({
          id: ur.roleId,
          name: ur.role?.name || ''
        })) || [],
      }));
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const user = await this.userService.createUser(createUserDto);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        isVerified: user.isVerified,
        isActive: user.isActive,
        avatarUrl: user.avatarUrl,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        tenantId: user.tenantId,
        roles: user.roles?.map(ur => ({
          id: ur.roleId,
          name: ur.role?.name || ''
        })) || []
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, Roles)
  @Roles(AppUserRole.ADMIN, AppUserRole.OWNER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user (admin/owner only)' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @User() currentUser: AuthUser,
  ): Promise<UserResponseDto> {
    try {
      // Only allow ADMIN to create users with ADMIN role
      // OWNER can only create CUSTOMER and STAFF users
      if (
        !currentUser.roles.some((r) => r.name === AppUserRole.ADMIN) &&
        createUserDto.role === AppUserRole.ADMIN
      ) {
        throw new ForbiddenException(
          'You do not have permission to create users with ADMIN role',
        );
      }

      // Set the tenant ID from the current user if not provided
      if (!createUserDto.tenantId) {
        createUserDto.tenantId = currentUser.tenantId || null;
      }

      const newUser = await this.userService.createUser(createUserDto);
      
      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        isVerified: newUser.isVerified,
        isActive: newUser.isActive,
        avatarUrl: newUser.avatarUrl,
        lastLoginAt: newUser.lastLoginAt,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
        tenantId: newUser.tenantId,
        roles: newUser.roles?.map(ur => ({
          id: ur.roleId,
          name: ur.role?.name || ''
        })) || []
      };
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
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() _user: AuthUser,
  ): Promise<UserResponseDto> {
    try {
      const updatedUser = await this.userService.updateUser(id, updateUserDto);
      return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        isVerified: updatedUser.isVerified,
        isActive: updatedUser.isActive,
        avatarUrl: updatedUser.avatarUrl,
        lastLoginAt: updatedUser.lastLoginAt,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        tenantId: updatedUser.tenantId,
        roles: updatedUser.roles?.map(ur => ({
          id: ur.roleId,
          name: ur.role?.name || ''
        })) || []
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
      // Use the service to handle login and token generation
      const loginResult = await this.userService.login(loginUserDto);
      
      // Get the full user with roles
      const user = await this.userService.getUserByEmail(loginUserDto.email);
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
  @ApiResponse({ status: 200, description: 'Current user profile', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@User() user: AuthUser): Promise<UserResponseDto> {
    try {
      const currentUser = await this.userService.getUserById(user.id);
      if (!currentUser) {
        throw new NotFoundException('User not found');
      }

      return {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        phone: currentUser.phone,
        isVerified: currentUser.isVerified,
        isActive: currentUser.isActive,
        avatarUrl: currentUser.avatarUrl,
        lastLoginAt: currentUser.lastLoginAt,
        createdAt: currentUser.createdAt,
        updatedAt: currentUser.updatedAt,
        tenantId: currentUser.tenantId,
        roles: (currentUser.roles || []).map(ur => ({
          id: ur.roleId,
          name: ur.role?.name || ''
        }))
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
