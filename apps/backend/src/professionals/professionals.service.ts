/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ProfessionalsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createProfessionalDto: CreateProfessionalDto,
    companyId: string,
  ) {
    // Check if email already exists in this company
    const existingUser = await this.prisma.user.findFirst({
      where: { 
        email: createProfessionalDto.email,
        companyId: companyId
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists in this company');
    }

    // Hash the provided password
    const hashedPassword = await bcrypt.hash(createProfessionalDto.password, 10);

    // Create professional record first
    const professional = await this.prisma.professional.create({
      data: {
        name: createProfessionalDto.name,
        email: createProfessionalDto.email,
        phone: createProfessionalDto.phone,
        commission: createProfessionalDto.commission,
        companyId,
      },
    });

    // Create user account for the professional and link to professional
    await this.prisma.user.create({
      data: {
        email: createProfessionalDto.email,
        password: hashedPassword,
        firstName:
          createProfessionalDto.name.split(' ')[0] ||
          createProfessionalDto.name,
        lastName:
          createProfessionalDto.name.split(' ').slice(1).join(' ') || '',
        role: 'USER', // Professionals are regular users
        companyId,
        professionalId: professional.id, // Link user to professional
      },
    });

    // Return professional with appointments
    const professionalWithAppointments = await this.prisma.professional.findUnique({
      where: { id: professional.id },
      include: {
        appointments: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            clientName: true,
            service: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    return {
      ...professionalWithAppointments,
      loginCredentials: {
        email: createProfessionalDto.email,
        password: createProfessionalDto.password,
      },
    };
  }


  async findAll(companyId: string) {
    return this.prisma.professional.findMany({
      where: { companyId },
      include: {
        appointments: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            clientName: true,
            service: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const professional = await this.prisma.professional.findFirst({
      where: { id, companyId },
      include: {
        appointments: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            clientName: true,
            service: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    return professional;
  }

  async update(
    id: string,
    updateProfessionalDto: UpdateProfessionalDto,
    companyId: string,
  ) {
    await this.findOne(id, companyId); // Check if professional exists and belongs to company

    return this.prisma.professional.update({
      where: { id },
      data: updateProfessionalDto,
      include: {
        appointments: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            clientName: true,
            service: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);

    // Check if professional has appointments
    const appointmentsCount = await this.prisma.appointment.count({
      where: { professionalId: id },
    });

    if (appointmentsCount > 0) {
      throw new ForbiddenException(
        'Cannot delete professional with existing appointments',
      );
    }

    return this.prisma.professional.delete({
      where: { id },
    });
  }

  async getAvailableSlots(
    professionalId: string,
    date: string,
    companyId: string,
  ) {
    // Get professional's appointments for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        professionalId,
        companyId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Generate available time slots (every 30 minutes from 8 AM to 6 PM)
    const availableSlots = [];
    const startHour = 8;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStart = new Date(startOfDay);
        slotStart.setHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30);

        // Check if this slot conflicts with existing appointments
        const hasConflict = appointments.some((appointment) => {
          return (
            (slotStart >= appointment.startTime &&
              slotStart < appointment.endTime) ||
            (slotEnd > appointment.startTime &&
              slotEnd <= appointment.endTime) ||
            (slotStart <= appointment.startTime &&
              slotEnd >= appointment.endTime)
          );
        });

        if (!hasConflict) {
          availableSlots.push({
            startTime: slotStart,
            endTime: slotEnd,
          });
        }
      }
    }

    return availableSlots;
  }

  async findByUserEmail(email: string, companyId: string) {
    return this.prisma.professional.findFirst({
      where: {
        email,
        companyId,
      },
    });
  }

  async getMyAppointments(professionalId: string, companyId: string) {
    return this.prisma.appointment.findMany({
      where: {
        professionalId,
        companyId,
      },
      select: {
        id: true,
        clientName: true,
        clientPhone: true,
        clientEmail: true,
        startTime: true,
        endTime: true,
        status: true,
        notes: true,
        service: {
          select: {
            name: true,
            price: true,
            duration: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async getMySchedule(
    professionalId: string,
    companyId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = {
      professionalId,
      companyId,
    };

    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    return this.prisma.appointment.findMany({
      where,
      select: {
        id: true,
        clientName: true,
        clientPhone: true,
        startTime: true,
        endTime: true,
        status: true,
        service: {
          select: {
            name: true,
            price: true,
            duration: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async getAvailableServices(companyId: string) {
    return this.prisma.service.findMany({
      where: {
        companyId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        duration: true,
        category: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
