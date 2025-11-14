import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { PriceAlertCondition } from '@prisma/client';

export class CreateAlertDto {
  @ApiProperty({ example: 'uuid-of-product' })
  @IsUUID()
  productId: string;

  @ApiProperty({
    example: 'DROPS_BELOW',
    enum: PriceAlertCondition,
  })
  @IsEnum(PriceAlertCondition)
  condition: PriceAlertCondition;

  @ApiProperty({ example: 24000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetPrice?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  percentage?: number;
}
