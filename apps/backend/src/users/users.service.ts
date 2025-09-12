import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
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
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
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
