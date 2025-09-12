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
}
