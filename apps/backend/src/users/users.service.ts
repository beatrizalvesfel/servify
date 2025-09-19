import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    if (!createUserDto.companyId) {
      throw new Error('companyId is required');
    }
    
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: createUserDto.password,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        companyId: createUserDto.companyId,
        lastLoginAt: createUserDto.lastLoginAt,
      },
      include: {
        company: true,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId },
      include: {
        company: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        company: true,
        professional: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    // Find the first active user with this email
    return this.prisma.user.findFirst({
      where: { 
        email,
        isActive: true
      },
      include: {
        company: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // Check if user exists

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        company: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if user exists

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
