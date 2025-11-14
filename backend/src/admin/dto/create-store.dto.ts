import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({ example: 'Amazon México' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'amazon-mx' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'https://www.amazon.com.mx' })
  @IsUrl()
  @IsNotEmpty()
  website: string;

  @ApiProperty({ example: 'https://example.com/logo.png', required: false })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    example: '{"price": ".a-price-whole", "title": "#productTitle"}',
    required: false
  })
  @IsOptional()
  @IsString()
  scrapingSelector?: string;
}
