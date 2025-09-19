import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequireRole } from '../auth/guards/role.guard';

@Controller('professionals')
@UseGuards(JwtAuthGuard, RequireRole(['ADMIN']))
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Post()
  create(@Body() createProfessionalDto: CreateProfessionalDto, @Request() req) {
    const companyId = req.tenant?.id || req.user?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.professionalsService.create(createProfessionalDto, companyId);
  }

  @Get()
  findAll(@Request() req) {
    const companyId = req.tenant?.id || req.user?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.professionalsService.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const companyId = req.tenant?.id || req.user?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.professionalsService.findOne(id, companyId);
  }

  @Get(':id/available-slots')
  getAvailableSlots(
    @Param('id') id: string,
    @Query('date') date: string,
    @Request() req,
  ) {
    const companyId = req.tenant?.id || req.user?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.professionalsService.getAvailableSlots(id, date, companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProfessionalDto: UpdateProfessionalDto,
    @Request() req,
  ) {
    const companyId = req.tenant?.id || req.user?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.professionalsService.update(id, updateProfessionalDto, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const companyId = req.tenant?.id || req.user?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.professionalsService.remove(id, companyId);
  }
}
