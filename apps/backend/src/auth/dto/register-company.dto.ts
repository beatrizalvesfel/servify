import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterCompanyDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;
}
