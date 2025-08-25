import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { BaseUserDto } from './base-user.dto';
import { AppUserRole } from '@shared/types/user.types';

/**
 * User creation data transfer object
 *
 * @remarks
 * This DTO is used for creating new users in the system.
 * Extends BaseUserDto and adds password field.
 *
 * @public
 */
export class CreateUserDto extends BaseUserDto {
  @ApiProperty({
    description: 'User password',
    required: true,
    minLength: 6,
    example: 'securePassword123!',
    type: String,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsNotEmpty()
  password!: string;

  // tenantId is already defined in BaseUserDto

  @ApiPropertyOptional({
    description: 'User roles',
    type: [String],
    example: [AppUserRole.CUSTOMER],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles?: string[] = [AppUserRole.CUSTOMER];

  @ApiPropertyOptional({
    description: 'Whether the user is verified',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean = false;

  @ApiPropertyOptional({
    description: 'Whether the user is a SaaS owner',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  saasOwner?: boolean = false;

  @ApiPropertyOptional({
    description: 'Whether the user is salon staff',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  salonStaff?: boolean = false;

  @ApiPropertyOptional({
    description: 'Whether the user is a customer',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  customer?: boolean = true;

  // tenantId, phone, and role are already defined in BaseUserDto | null;
}
