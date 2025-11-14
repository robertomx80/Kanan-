import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John',
    description: 'First name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    example: 'oldPassword123',
    description: 'Current password',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'New password (min 6 characters)',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  newPassword: string;
}
