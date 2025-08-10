import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSalonDto {
  @ApiProperty({ description: 'The name of the salon' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The address of the salon' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'The zip code of the salon' })
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @ApiProperty({ description: 'The city where the salon is located' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'The latitude coordinate of the salon location' })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ description: 'The longitude coordinate of the salon location' })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({ description: 'The ID of the salon owner (user)' })
  @IsString()
  @IsNotEmpty()
  ownerId: string;
}
