import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppointmentStatus } from '@prisma/client';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    const companyId = req.tenant?.id || req.user?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.appointmentsService.create(createAppointmentDto, companyId);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('professionalId') professionalId?: string,
    @Query('serviceId') serviceId?: string,
    @Query('status') status?: AppointmentStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const companyId = req.tenant?.id || req.user?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    const filters = {
      professionalId,
      serviceId,
      status,
      startDate,
      endDate,
    };
    return this.appointmentsService.findAll(companyId, filters);
  }

  @Get('available-slots')
  getAvailableSlots(
    @Request() req,
    @Query('professionalId') professionalId: string,
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    const companyId = req.tenant?.id || req.user?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.appointmentsService.getAvailableSlots(professionalId, serviceId, date, companyId);
  }

  @Get('date-range')
  getAppointmentsByDateRange(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const companyId = req.tenant?.id || req.user?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.appointmentsService.getAppointmentsByDateRange(companyId, startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const companyId = req.tenant?.id || req.user?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.appointmentsService.findOne(id, companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto, @Request() req) {
    const companyId = req.tenant?.id || req.user?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.appointmentsService.update(id, updateAppointmentDto, companyId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: AppointmentStatus,
    @Request() req,
  ) {
    const companyId = req.tenant?.id || req.user?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.appointmentsService.updateStatus(id, status, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const companyId = req.tenant?.id || req.user?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.appointmentsService.remove(id, companyId);
  }
}
