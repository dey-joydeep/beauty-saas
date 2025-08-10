import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchSalonsDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  service?: string;

  @ApiProperty({ required: false, minimum: 0, maximum: 5 })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  @Type(() => Number)
  minRating?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 5 })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  @Type(() => Number)
  maxRating?: number;

  @ApiProperty({ required: false, minimum: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiProperty({ required: false, minimum: 1, maximum: 100 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
