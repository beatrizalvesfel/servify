import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private companiesService: CompaniesService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
    companyId?: string,
  ): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      // If companyId is provided, validate that user belongs to that company
      if (companyId && user.companyId !== companyId) {
        return null; // User doesn't belong to this company
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      companyId: user.companyId,
      role: user.role,
      professionalId: user.professionalId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
        companySlug: user.company?.slug,
      },
    };
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    companyId: string,
  ) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.usersService.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        companyId,
      });

      return this.login(user);
    } catch (error) {
      console.error('Error in register:', error);
      throw error;
    }
  }

  async registerCompany(
    email: string,
    password: string,
    companyName: string,
  ) {
    try {
      // Create company first
      const company = await this.companiesService.create({
        name: companyName,
        slug: companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      });

      // Create admin user for the company
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.usersService.create({
        email,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: companyName,
        companyId: company.id,
      });

      return this.login(user);
    } catch (error) {
      console.error('Error in registerCompany:', error);
      throw error;
    }
  }

  async registerProfessional(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    companyCode: string,
  ) {
    try {
      // Find company by registration code
      const company = await this.companiesService.findByRegistrationCode(companyCode);
      if (!company) {
        throw new Error('Invalid company code');
      }

      // Create professional user
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.usersService.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        companyId: company.id,
      });

      return this.login(user);
    } catch (error) {
      console.error('Error in registerProfessional:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string) {
    const user = await this.usersService.findOne(userId);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companyId: user.companyId,
      companySlug: user.company?.slug,
      professionalId: user.professional?.id,
    };
  }

  async logout(userId: string) {
    // Update lastLoginAt to track logout time
    await this.usersService.update(userId, {
      lastLoginAt: new Date(),
    });

    return {
      message: 'Logout realizado com sucesso',
      timestamp: new Date().toISOString(),
    };
  }
}
