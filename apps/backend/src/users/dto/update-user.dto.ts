import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsDateString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsDateString()
  lastLoginAt?: Date;
}
