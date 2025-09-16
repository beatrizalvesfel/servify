import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsOptional()
  @IsDateString()
  lastLoginAt?: Date;
}
