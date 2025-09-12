import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  domain?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsOptional()
  settings?: any;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
