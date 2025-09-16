import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class TenantAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { email, password } = request.body;

    // Get tenant from middleware
    const tenant = request.tenant;
    if (!tenant) {
      throw new UnauthorizedException('Tenant não identificado');
    }

    // Validate user belongs to this tenant
    const user = await this.authService.validateUser(email, password, tenant.id);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas ou usuário não pertence a esta empresa');
    }

    // Attach user to request
    request.user = user;
    return true;
  }
}
