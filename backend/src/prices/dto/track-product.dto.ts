import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class TrackProductDto {
  @ApiProperty({ example: 'uuid-of-product' })
  @IsUUID()
  productId: string;
}
