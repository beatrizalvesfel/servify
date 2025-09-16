import { IsString, IsNotEmpty, IsOptional, IsEmail, IsDateString, IsEnum, IsUUID } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsOptional()
  @IsString()
  clientPhone?: string;

  @IsOptional()
  @IsEmail()
  clientEmail?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsString()
  @IsNotEmpty()
  professionalId: string;
}
