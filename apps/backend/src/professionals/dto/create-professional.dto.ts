import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, Min, Max, MinLength } from 'class-validator';

export class CreateProfessionalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string; // Required for login

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string; // Required for login

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  commission: number; // Commission percentage (0-100)
}
