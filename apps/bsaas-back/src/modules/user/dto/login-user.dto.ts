import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

/**
 * User login data transfer object
 * 
 * @remarks
 * This DTO is used for authenticating users in the system.
 * It includes the user's email, password, and an optional remember me flag.
 * 
 * @public
 */
export class LoginUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User\'s email address',
    pattern: '^[^\s@]+@[^\s@]+\.[^\s@]+$',
    maxLength: 255,
    type: String
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({
    example: 'yourSecurePassword123!',
    description: 'User\'s password',
    minLength: 8,
    type: String,
    format: 'password'
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether to remember the user for an extended period',
    default: false
  })
  @IsBoolean()
  @IsOptional()
  rememberMe: boolean = false;
}
