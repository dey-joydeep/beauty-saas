import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SalonQueryDto {
  @ApiPropertyOptional({ 
    description: 'The page number for pagination',
    default: 1,
    minimum: 1
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'The number of items per page',
    default: 10,
    minimum: 1,
    maximum: 100
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ 
    description: 'Search term for salon name or address',
    required: false 
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by city',
    required: false 
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by zip code',
    required: false 
  })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiPropertyOptional({ 
    description: 'User latitude for distance calculation',
    required: false 
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ 
    description: 'User longitude for distance calculation',
    required: false 
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ 
    description: 'Maximum distance in kilometers (requires latitude and longitude)',
    required: false 
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxDistanceKm?: number;
}
