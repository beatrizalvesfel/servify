import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly allowedRoles: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!this.allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

// Factory function to create role guards
export const RequireRole = (roles: string[]) => {
  return new RoleGuard(roles);
};

