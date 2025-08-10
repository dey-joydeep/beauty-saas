import { ApiProperty } from '@nestjs/swagger';

export class SalonResponseDto {
  @ApiProperty({ description: 'The unique identifier of the salon' })
  id: string;

  @ApiProperty({ description: 'The name of the salon' })
  name: string;

  @ApiProperty({ description: 'The address of the salon' })
  address: string;

  @ApiProperty({ description: 'The zip code of the salon' })
  zipCode: string;

  @ApiProperty({ description: 'The city where the salon is located' })
  city: string;

  @ApiProperty({ description: 'The latitude coordinate of the salon location' })
  latitude: number;

  @ApiProperty({ description: 'The longitude coordinate of the salon location' })
  longitude: number;

  @ApiProperty({ description: 'The ID of the salon owner (user)' })
  ownerId: string;

  @ApiProperty({ description: 'The date when the salon was created', type: Date })
  createdAt: Date;

  @ApiProperty({ description: 'The date when the salon was last updated', type: Date })
  updatedAt: Date;

  @ApiProperty({ 
    description: 'The distance from the search location in kilometers',
    required: false 
  })
  distanceKm?: number;

  @ApiProperty({ 
    description: 'The average rating of the salon',
    required: false 
  })
  averageRating?: number;
}
