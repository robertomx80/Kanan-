import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSystemConfigDto {
  @ApiProperty({ example: 'SCRAPER_INTERVAL' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: '21600000' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ example: 'Intervalo de scraping en milisegundos (6 horas)', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
