import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto, companyId: string) {
    const { serviceId, professionalId, startTime, endTime } =
      createAppointmentDto;

    // Validate that service and professional belong to the company
    const [service, professional] = await Promise.all([
      this.prisma.service.findFirst({
        where: { id: serviceId, companyId, isActive: true },
      }),
      this.prisma.professional.findFirst({
        where: { id: professionalId, companyId, isActive: true },
      }),
    ]);

    if (!service) {
      throw new NotFoundException('Service not found or inactive');
    }

    if (!professional) {
      throw new NotFoundException('Professional not found or inactive');
    }

    // Validate time slots
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (start < new Date()) {
      throw new BadRequestException('Cannot create appointments in the past');
    }

    // Check for conflicts with existing appointments
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        professionalId,
        companyId,
        status: {
          not: AppointmentStatus.CANCELLED,
        },
        OR: [
          {
            startTime: {
              lt: end,
              gte: start,
            },
          },
          {
            endTime: {
              gt: start,
              lte: end,
            },
          },
          {
            startTime: { lte: start },
            endTime: { gte: end },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      const conflictStart = new Date(
        conflictingAppointment.startTime,
      ).toLocaleString();
      const conflictEnd = new Date(
        conflictingAppointment.endTime,
      ).toLocaleString();
      throw new ConflictException(
        `Time slot conflicts with existing appointment (${conflictStart} - ${conflictEnd})`,
      );
    }

    // Validate appointment duration matches service duration
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    if (Math.abs(durationMinutes - service.duration) > 5) {
      // Allow 5 minutes tolerance
      throw new BadRequestException(
        `Appointment duration must match service duration (${service.duration} minutes)`,
      );
    }

    return this.prisma.appointment.create({
      data: {
        ...createAppointmentDto,
        companyId,
        startTime: start,
        endTime: end,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            category: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async findAll(
    companyId: string,
    filters?: {
      professionalId?: string;
      serviceId?: string;
      status?: AppointmentStatus;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const where: any = { companyId };

    if (filters?.professionalId) {
      where.professionalId = filters.professionalId;
    }

    if (filters?.serviceId) {
      where.serviceId = filters.serviceId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.startTime = {};
      if (filters.startDate) {
        where.startTime.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.startTime.lte = new Date(filters.endDate);
      }
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            category: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, companyId },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            category: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    companyId: string,
  ) {
    const existingAppointment = await this.findOne(id, companyId);

    // If updating time, validate conflicts
    if (updateAppointmentDto.startTime || updateAppointmentDto.endTime) {
      const startTime = updateAppointmentDto.startTime
        ? new Date(updateAppointmentDto.startTime)
        : existingAppointment.startTime;
      const endTime = updateAppointmentDto.endTime
        ? new Date(updateAppointmentDto.endTime)
        : existingAppointment.endTime;
      const professionalId =
        updateAppointmentDto.professionalId ||
        existingAppointment.professionalId;

      if (startTime >= endTime) {
        throw new BadRequestException('Start time must be before end time');
      }

      // Check for conflicts with other appointments
      const conflictingAppointment = await this.prisma.appointment.findFirst({
        where: {
          id: { not: id },
          professionalId,
          companyId,
          status: {
            not: AppointmentStatus.CANCELLED,
          },
          OR: [
            {
              startTime: {
                lt: endTime,
                gte: startTime,
              },
            },
            {
              endTime: {
                gt: startTime,
                lte: endTime,
              },
            },
            {
              startTime: { lte: startTime },
              endTime: { gte: endTime },
            },
          ],
        },
      });

      if (conflictingAppointment) {
        throw new ConflictException(
          'Time slot conflicts with existing appointment',
        );
      }
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...updateAppointmentDto,
        ...(updateAppointmentDto.startTime && {
          startTime: new Date(updateAppointmentDto.startTime),
        }),
        ...(updateAppointmentDto.endTime && {
          endTime: new Date(updateAppointmentDto.endTime),
        }),
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            category: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.appointment.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: AppointmentStatus, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            category: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async getAvailableSlots(
    professionalId: string,
    serviceId: string,
    date: string,
    companyId: string,
  ) {
    // Validate professional and service
    const [professional, service] = await Promise.all([
      this.prisma.professional.findFirst({
        where: { id: professionalId, companyId, isActive: true },
      }),
      this.prisma.service.findFirst({
        where: { id: serviceId, companyId, isActive: true },
      }),
    ]);

    if (!professional) {
      throw new NotFoundException('Professional not found or inactive');
    }

    if (!service) {
      throw new NotFoundException('Service not found or inactive');
    }

    // Get professional's appointments for the date
    // Parse date as local date to avoid timezone issues
    const dateObj = new Date(date + 'T00:00:00');
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateObj);
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
          not: AppointmentStatus.CANCELLED,
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Generate all possible time slots (available and occupied)
    const allSlots = [];
    const availableSlots = [];
    const occupiedSlots = [];
    const startHour = 8;
    const endHour = 18;
    const slotDuration = service.duration;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStart = new Date(startOfDay);
        slotStart.setHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

        // Skip if slot goes beyond working hours
        if (slotEnd.getHours() > endHour) {
          continue;
        }

        // Check if this slot conflicts with existing appointments
        let conflictType = null;
        let isOccupied = false;
        let conflictingAppointment = null;

        // Check each existing appointment to determine conflict type
        for (const appointment of appointments) {
          const appointmentStart = new Date(appointment.startTime);
          const appointmentEnd = new Date(appointment.endTime);

          const slotStartTime = slotStart.getTime();
          const slotEndTime = slotEnd.getTime();
          const appointmentStartTime = appointmentStart.getTime();
          const appointmentEndTime = appointmentEnd.getTime();

          // Rule 1: If slot start time is within an existing appointment → OCCUPIED (red)
          if (
            slotStartTime >= appointmentStartTime &&
            slotStartTime < appointmentEndTime
          ) {
            conflictType = 'occupied';
            isOccupied = true;
            conflictingAppointment = appointment;
            break; // Found direct conflict, no need to check further
          }

          // Rule 2: If slot end time would extend into an existing appointment → DURATION_CONFLICT (orange)
          if (
            slotEndTime > appointmentStartTime &&
            slotEndTime <= appointmentEndTime
          ) {
            conflictType = 'duration_conflict';
            isOccupied = false;
            conflictingAppointment = appointment;
            break; // Found duration conflict, no need to check further
          }

          // Rule 3: If existing appointment is completely within the slot → DURATION_CONFLICT (orange)
          if (
            appointmentStartTime >= slotStartTime &&
            appointmentEndTime <= slotEndTime
          ) {
            conflictType = 'duration_conflict';
            isOccupied = false;
            conflictingAppointment = appointment;
            break; // Found duration conflict, no need to check further
          }
        }

        const slot = {
          startTime: slotStart,
          endTime: slotEnd,
          isAvailable: !conflictingAppointment,
          isOccupied: isOccupied,
          conflictType: conflictType,
          conflictingAppointment: conflictingAppointment
            ? {
                startTime: conflictingAppointment.startTime,
                endTime: conflictingAppointment.endTime,
              }
            : null,
        };

        allSlots.push(slot);

        if (conflictingAppointment) {
          occupiedSlots.push(slot);
        } else {
          availableSlots.push(slot);
        }
      }
    }

    return {
      available: availableSlots,
      occupied: occupiedSlots,
      all: allSlots,
    };
  }

  async getAppointmentsByDateRange(
    companyId: string,
    startDate: string,
    endDate: string,
  ) {
    return this.prisma.appointment.findMany({
      where: {
        companyId,
        startTime: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            category: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }
}
