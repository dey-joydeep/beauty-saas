import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class ProductSaleDto {
  @ApiProperty({ description: 'ID of the product sale' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'ID of the product' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Name of the product' })
  @IsString()
  productName: string;

  @ApiProperty({ description: 'Quantity sold' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Price per unit' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: 'Total amount of the sale' })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({ description: 'Date of the sale' })
  @IsDateString()
  saleDate: Date;

  @ApiProperty({ description: 'ID of the staff who made the sale' })
  @IsUUID()
  soldById: string;

  @ApiProperty({ description: 'Name of the staff who made the sale' })
  @IsString()
  soldByName: string;

  @ApiProperty({ description: 'ID of the customer (if any)', required: false })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ description: 'Name of the customer (if any)', required: false })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({ description: 'ID of the related booking (if any)', required: false })
  @IsUUID()
  @IsOptional()
  bookingId?: string;

  @ApiProperty({ description: 'Additional notes about the sale', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateProductSaleDto {
  @ApiProperty({ description: 'ID of the product' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Quantity sold' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Price per unit' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: 'Total amount of the sale' })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({ description: 'Date of the sale', required: false })
  @IsDateString()
  @IsOptional()
  saleDate?: Date;

  @ApiProperty({ description: 'ID of the customer (if any)', required: false })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ description: 'ID of the related booking (if any)', required: false })
  @IsUUID()
  @IsOptional()
  bookingId?: string;

  @ApiProperty({ description: 'Additional notes about the sale', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ProductSalesFilterDto {
  @ApiProperty({ description: 'Start date for filtering sales', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ description: 'End date for filtering sales', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ description: 'ID of the product to filter by', required: false })
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiProperty({ description: 'ID of the staff who made the sale', required: false })
  @IsUUID()
  @IsOptional()
  soldById?: string;

  @ApiProperty({ description: 'ID of the customer', required: false })
  @IsUUID()
  @IsOptional()
  customerId?: string;
}

export class ProductSalesSummaryDto {
  @ApiProperty({ description: 'Total number of sales' })
  totalSales: number;

  @ApiProperty({ description: 'Total revenue from sales' })
  totalRevenue: number;

  @ApiProperty({ description: 'Total cost of goods sold' })
  totalCost: number;

  @ApiProperty({ description: 'Total profit (revenue - cost)' })
  totalProfit: number;

  @ApiProperty({ description: 'Number of products sold' })
  totalItemsSold: number;

  @ApiProperty({ description: 'Average sale value' })
  averageSaleValue: number;

  @ApiProperty({ description: 'Sales by product', type: [SalesByProductDto] })
  salesByProduct: SalesByProductDto[];

  @ApiProperty({ description: 'Sales by date', type: [SalesByDateDto] })
  salesByDate: SalesByDateDto[];
}

export class SalesByProductDto {
  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiProperty({ description: 'Product name' })
  productName: string;

  @ApiProperty({ description: 'Number of items sold' })
  quantity: number;

  @ApiProperty({ description: 'Total revenue from this product' })
  revenue: number;

  @ApiProperty({ description: 'Percentage of total sales' })
  percentage: number;
}

export class SalesByDateDto {
  @ApiProperty({ description: 'Date of sales' })
  date: string;

  @ApiProperty({ description: 'Total sales for this date' })
  sales: number;

  @ApiProperty({ description: 'Number of items sold' })
  items: number;
}
