import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
