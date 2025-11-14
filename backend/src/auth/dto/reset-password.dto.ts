import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'abc123token',
    description: 'Reset password token received by email',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'NewSecurePassword123',
    description: 'New password (min 6 characters)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  newPassword: string;
}
