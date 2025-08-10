import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { AppUserRole } from '@shared/types/user.types';
import { BaseUserDto } from './base-user.dto';

/**
 * User update data transfer object
 * 
 * @remarks
 * This DTO is used for updating existing users in the system.
 * All fields are optional and only provided fields will be updated.
 * 
 * @public
 */
export class UpdateUserDto extends PartialType(BaseUserDto) {
  @ApiPropertyOptional({
    example: 'newpassword123',
    description: 'New password (min 8 characters)',
    minLength: 8,
    type: String,
    required: false
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    example: AppUserRole.CUSTOMER,
    description: `User's role in the system`,
    enum: Object.values(AppUserRole),
    required: false
  })
  @IsOptional()
  declare role?: AppUserRole;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the user is active in the system',
    required: false
  })
  @IsBoolean()
  @IsOptional()
  declare isActive?: boolean;

  @ApiPropertyOptional({
    example: 'CurrentPass123!',
    description: 'Current password (required when changing password or email)',
    minLength: 8,
    type: String,
    required: false
  })
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @ApiPropertyOptional({
    example: true,
    description: `Whether the user's email has been verified.\n\
**Note:** This field is typically managed by the system`,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  declare isVerified?: boolean;
}
