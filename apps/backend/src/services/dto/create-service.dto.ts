import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  @Max(1440) // Max 24 hours in minutes
  duration: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString({ message: 'Professional ID must be a valid string' })
  professionalId?: string | null; // If provided, this service is specific to a professional
}
