import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('professional-dashboard')
@UseGuards(JwtAuthGuard)
export class ProfessionalDashboardController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Get('my-appointments')
  async getMyAppointments(@Request() req) {
    // Get professional by user email
    const professional = await this.professionalsService.findByUserEmail(
      req.user.email,
      req.user.companyId,
    );

    if (!professional) {
      throw new Error('Professional not found');
    }

    return this.professionalsService.getMyAppointments(professional.id, req.user.companyId);
  }

  @Get('my-schedule')
  async getMySchedule(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Get professional by user email
    const professional = await this.professionalsService.findByUserEmail(
      req.user.email,
      req.user.companyId,
    );

    if (!professional) {
      throw new Error('Professional not found');
    }

    return this.professionalsService.getMySchedule(
      professional.id,
      req.user.companyId,
      startDate,
      endDate,
    );
  }

  @Get('available-services')
  async getAvailableServices(@Request() req) {
    return this.professionalsService.getAvailableServices(req.user.companyId);
  }
}
