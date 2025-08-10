import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppUserRole } from '@shared/types/user.types';

/**
 * User role response DTO
 * 
 * @remarks
 * This DTO represents a user role in the system response.
 * 
 * @public
 */
export class UserRoleResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Role ID',
    type: Number
  })
  id!: number;

  @ApiProperty({
    example: 'ADMIN',
    description: 'Role name',
    enum: Object.values(AppUserRole)
  })
  name!: string;
}

/**
 * User response DTO
 * 
 * @remarks
 * This DTO represents a user in the system response.
 * 
 * @public
 */
export class UserResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User ID',
    format: 'uuid'
  })
  id!: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User\'s email address'
  })
  email!: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'User\'s full name',
    nullable: true
  })
  name!: string | null;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'User\'s phone number',
    nullable: true
  })
  phone!: string | null;

  @ApiProperty({
    example: true,
    description: 'Whether the user is active',
    default: true
  })
  isActive!: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether the user\'s email is verified'
  })
  isVerified!: boolean;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'URL to the user\'s avatar',
    nullable: true
  })
  avatarUrl!: string | null;

  @ApiPropertyOptional({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Timestamp of the last login',
    nullable: true,
    type: 'string',
    format: 'date-time'
  })
  lastLoginAt!: Date | null;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Timestamp when the user was created',
    type: 'string',
    format: 'date-time'
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Timestamp when the user was last updated',
    type: 'string',
    format: 'date-time'
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    example: 'tenant-123',
    description: 'ID of the tenant the user belongs to',
    nullable: true
  })
  tenantId!: string | null;

  @ApiProperty({
    type: [UserRoleResponseDto],
    description: 'User roles'
  })
  roles!: UserRoleResponseDto[];
}
