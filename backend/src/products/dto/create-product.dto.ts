import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  MaxLength,
  IsUUID,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro Max 256GB' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'El iPhone más avanzado', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Apple', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ example: 'iPhone 15 Pro Max', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ example: 'SKU123456', required: false })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: 'uuid-of-category', required: false })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsString()
  mainImage?: string;

  @ApiProperty({
    example: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiProperty({
    example: ['5G', '256GB Storage', 'A17 Pro Chip'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  features?: string[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
