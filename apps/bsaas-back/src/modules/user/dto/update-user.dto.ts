import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { AppUserRole } from '@shared/types/user.types';
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

/**
 * User update data transfer object
 * 
 * @remarks
 * This DTO is used for updating existing users in the system.
 * Only fields that are provided will be updated.
 * 
 * @public
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    example: 'updated@example.com',
    description: 'New email address for the user',
    pattern: '^[^\s@]+@[^\s@]+\.[^\s@]+$',
    maxLength: 255,
    type: String,
    required: false
  })
  @IsEmail()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  override email?: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'User\'s full name',
    maxLength: 255,
    type: String,
    required: false
  })
  @IsString()
  @IsOptional()
  override name?: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'User\'s phone number',
    pattern: '^\\+[1-9]\\d{1,14}$',
    maxLength: 20,
    type: String,
    required: false,
    nullable: true
  })
  @IsString()
  @IsOptional()
  override phone?: string | null;

  @ApiPropertyOptional({
    example: 'CUSTOMER',
    description: `New role for the user. \n\
**Role Assignment Rules:**
- **${AppUserRole.ADMIN}**: Can only be assigned by another ADMIN
- **${AppUserRole.OWNER}**: Can be assigned by ADMIN or OWNER
- **${AppUserRole.STAFF}**: Can be assigned by ADMIN, OWNER, or STAFF
- **${AppUserRole.CUSTOMER}**: Default role, can be assigned by any role

**Note:** Users can only assign roles that are at or below their own role in the hierarchy.`,
    enum: AppUserRole,
    enumName: 'AppUserRole',
    type: String,
    required: false
  })
  @IsEnum(AppUserRole)
  @IsOptional()
  override role?: AppUserRole;

  @ApiPropertyOptional({
    example: 'NewSecurePass123!',
    description: 'New password for the user',
    minLength: 8,
    maxLength: 100,
    type: String,
    format: 'password',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\da-zA-Z]).{8,}$',
    required: false
  })
  @IsString()
  @MinLength(8)
  @IsOptional()
  override password?: string;

  @ApiPropertyOptional({
    example: 'CurrentPass123!',
    description: 'Current password (required when changing password or email)',
    minLength: 8,
    maxLength: 100,
    type: String,
    format: 'password',
    required: false
  })
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @ApiPropertyOptional({
    example: true,
    description: `Whether the user account is active. \n\
**Note:**
- Only admins can deactivate users with equal or higher privileges
- Deactivating a user will log them out of all sessions`,
    type: Boolean,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: `Whether the user's email has been verified. \n\
**Note:**
- This field is typically managed by the system
- Only admins can manually override this field`,
    type: Boolean,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @ApiPropertyOptional({
    example: 'tenant123',
    description: `Tenant ID that the user belongs to. \n\
**Note:**
- Required for all non-customer roles
- Can only be changed by admins
- Changing this will move the user to a different organization`,
    type: String,
    minLength: 1,
    maxLength: 255,
    required: false,
    nullable: true
  })
  @IsString()
  @IsOptional()
  override tenantId?: string | null;
}
