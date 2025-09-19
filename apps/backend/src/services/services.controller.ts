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
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  create(@Body() createServiceDto: CreateServiceDto, @Request() req) {
    const companyId = req.tenant?.id || req.user?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.servicesService.create(createServiceDto, companyId);
  }

  @Get()
  findAll(@Request() req, @Query('category') category?: string) {
    const companyId = req.tenant?.id || req.user?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    if (category) {
      return this.servicesService.findByCategory(category, companyId);
    }
    
    // Get user role and professional ID for filtering
    const userRole = req.user?.role;
    const professionalId = req.user?.professionalId; // We'll need to add this to the user model
    
    return this.servicesService.findAll(companyId, userRole, professionalId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const companyId = req.tenant?.id || req.user?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.servicesService.findOne(id, companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @Request() req,
  ) {
    const companyId = req.tenant?.id || req.user?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.servicesService.update(id, updateServiceDto, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const companyId = req.tenant?.id || req.user?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.servicesService.remove(id, companyId);
  }
}
