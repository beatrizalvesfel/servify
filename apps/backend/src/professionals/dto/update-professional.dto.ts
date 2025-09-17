import {
  IsString,
  IsOptional,
  IsEmail,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class UpdateProfessionalDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  phone?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Commission must be a number' })
  @Min(0, { message: 'Commission must be at least 0' })
  @Max(100, { message: 'Commission must be at most 100' })
  commission?: number;
}