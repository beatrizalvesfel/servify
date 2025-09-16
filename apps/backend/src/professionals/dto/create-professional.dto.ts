import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, Min, Max } from 'class-validator';

export class CreateProfessionalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string; // Required for login

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  commission: number; // Commission percentage (0-100)
}
