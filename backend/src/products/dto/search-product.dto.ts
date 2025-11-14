import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchProductDto {
  @ApiProperty({ example: 'iPhone', required: false })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ example: 'uuid-of-category', required: false })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ example: 'Apple', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ example: 50000, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ example: 1, required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 20, required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({
    example: 'name',
    required: false,
    enum: ['name', 'createdAt', 'price'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ example: 'desc', required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
