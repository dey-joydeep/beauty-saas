import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MinLength, IsEnum, IsNotEmpty } from 'class-validator';
import { AppUserRole } from '@shared/types/user.types';

/**
 * User creation data transfer object
 * 
 * @remarks
 * This DTO is used for creating new users in the system.
 * The role determines the level of access and permissions the user will have.
 * 
 * @public
 */

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
    required: true,
    pattern: '^[^\s@]+@[^\s@]+\.[^\s@]+$',
    maxLength: 255,
    type: String
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'User full name',
    maxLength: 255,
    type: String,
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
    minLength: 8,
    maxLength: 100,
    required: true,
    type: String,
    format: 'password',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$',
    examples: [
      'StrongP@ssw0rd!',
      'Secure123$Pass'
    ]
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ 
    example: '+1234567890', 
    description: 'User phone number', 
    required: false,
    nullable: true 
  })
  @IsString()
  @IsOptional()
  phone?: string | null;

  @ApiPropertyOptional({
    example: 'CUSTOMER',
    description: `User role that determines access level and permissions. \n\
**Available Roles:**
- **${AppUserRole.ADMIN}**: Full system access, can manage all resources and users
- **${AppUserRole.OWNER}**: Can manage their business(es) and staff
- **${AppUserRole.STAFF}**: Staff member with limited permissions
- **${AppUserRole.CUSTOMER}**: Standard customer with basic access

**Note:** Only users with appropriate permissions can assign certain roles.`,
    enum: AppUserRole,
    default: AppUserRole.CUSTOMER,
    enumName: 'AppUserRole',
    required: false,
    type: String
  })
  @IsEnum(AppUserRole, { 
    message: 'Invalid user role. Must be one of: ' + Object.values(AppUserRole).join(', ')
  })
  @IsOptional()
  role?: AppUserRole = AppUserRole.CUSTOMER;

  @ApiProperty({ 
    example: 'tenant123', 
    description: 'Tenant ID', 
    required: false,
    nullable: true 
  })
  @IsString()
  @IsOptional()
  tenantId?: string | null;
}
