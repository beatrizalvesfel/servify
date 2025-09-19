import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TenantAuthGuard } from './guards/tenant-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CompaniesService } from '../companies/companies.service';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { RegisterProfessionalDto } from './dto/register-professional.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private companiesService: CompaniesService,
  ) {}

  @Post('login')
  async login(@Body() loginData: { email: string; password: string }) {
    // Find user by email first
    const user = await this.authService.validateUser(loginData.email, loginData.password);
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    return this.authService.login(user);
  }

  @Post('register/company')
  async registerCompany(@Body() registerCompanyDto: RegisterCompanyDto) {
    return this.authService.registerCompany(
      registerCompanyDto.email,
      registerCompanyDto.password,
      registerCompanyDto.companyName,
    );
  }

  @Post('register/professional')
  async registerProfessional(@Body() registerProfessionalDto: RegisterProfessionalDto) {
    return this.authService.registerProfessional(
      registerProfessionalDto.email,
      registerProfessionalDto.password,
      registerProfessionalDto.firstName,
      registerProfessionalDto.lastName,
      registerProfessionalDto.companyCode,
    );
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    // For demo purposes, use the first company if no companyId provided
    let companyId = createUserDto.companyId;
    if (!companyId) {
      const companies = await this.companiesService.findAll();
      if (companies.length > 0) {
        companyId = companies[0].id;
      } else {
        throw new Error('No companies found. Please create a company first.');
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
  async getProfile(@Request() req) {
    // Get full user data including company information
    const user = await this.authService.getUserProfile(req.user.id);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }
}
