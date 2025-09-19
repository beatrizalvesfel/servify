import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: createCompanyDto,
      include: {
        users: true,
        invitations: true,
      },
    });
  }

  async findAll() {
    return this.prisma.company.findMany({
      include: {
        users: true,
        invitations: true,
      },
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        users: true,
        invitations: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async findBySlug(slug: string) {
    const company = await this.prisma.company.findUnique({
      where: { slug },
      include: {
        users: true,
        invitations: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async findByRegistrationCode(registrationCode: string) {
    const company = await this.prisma.company.findUnique({
      where: { registrationCode },
      include: {
        users: true,
        invitations: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    await this.findOne(id); // Check if company exists

    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
      include: {
        users: true,
        invitations: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if company exists

    return this.prisma.company.delete({
      where: { id },
    });
  }

  async generateRegistrationCode(id: string) {
    const company = await this.findOne(id);
    
    // Generate a 8-character registration code
    const registrationCode = Math.random().toString(36).substr(2, 8).toUpperCase();
    
    // Set expiration to 30 days from now
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    
    return this.prisma.company.update({
      where: { id },
      data: {
        registrationCode,
        registrationCodeExpiresAt: expirationDate,
      },
      include: {
        users: true,
        invitations: true,
      },
    });
  }
}
