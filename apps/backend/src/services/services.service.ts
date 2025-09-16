import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto, companyId: string) {
    return this.prisma.service.create({
      data: {
        ...createServiceDto,
        companyId,
      },
      include: {
        appointments: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            clientName: true,
          },
        },
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.service.findMany({
      where: { companyId },
      include: {
        appointments: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            clientName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const service = await this.prisma.service.findFirst({
      where: { id, companyId },
      include: {
        appointments: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            clientName: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto, companyId: string) {
    await this.findOne(id, companyId); // Check if service exists and belongs to company

    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
      include: {
        appointments: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            clientName: true,
          },
        },
      },
    });
  }

  async remove(id: string, companyId: string) {
    const service = await this.findOne(id, companyId);

    // Check if service has appointments
    const appointmentsCount = await this.prisma.appointment.count({
      where: { serviceId: id },
    });

    if (appointmentsCount > 0) {
      throw new ForbiddenException('Cannot delete service with existing appointments');
    }

    return this.prisma.service.delete({
      where: { id },
    });
  }

  async findByCategory(category: string, companyId: string) {
    return this.prisma.service.findMany({
      where: { category, companyId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}
