import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty, IsOptional } from 'class-validator';
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
    minLength: 8,
    example: 'securePassword123!',
    type: String
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password!: string;

  // Override role to make it optional with default value
  @ApiProperty({
    example: AppUserRole.CUSTOMER,
    description: `User role that determines access level and permissions.`,
    enum: Object.values(AppUserRole),
    default: AppUserRole.CUSTOMER,
    required: false
  })
  @IsOptional()
  declare role: AppUserRole;

  // Override tenantId to match base type
  @ApiProperty({ 
    example: 'tenant123', 
    description: 'Tenant ID', 
    required: false,
    nullable: true 
  })
  @IsString()
  @IsOptional()
  declare tenantId?: string | null;
}
