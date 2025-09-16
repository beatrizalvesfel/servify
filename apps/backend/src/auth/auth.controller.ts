import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TenantAuthGuard } from './guards/tenant-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(TenantAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    // For demo purposes, use the first company if no companyId provided
    let companyId = createUserDto.companyId;
    if (!companyId) {
      // Get the first company (demo company)
      const { CompaniesService } = await import('../companies/companies.service');
      const { PrismaService } = await import('../common/prisma/prisma.service');
      const prisma = new PrismaService();
      const companiesService = new CompaniesService(prisma);
      const companies = await companiesService.findAll();
      if (companies.length > 0) {
        companyId = companies[0].id;
      }
    }
    
    return this.authService.register(
      createUserDto.email,
      createUserDto.password,
      createUserDto.firstName,
      createUserDto.lastName,
      companyId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }
}
