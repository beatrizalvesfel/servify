import { Injectable, NestMiddleware, BadRequestException, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

declare module 'express-serve-static-core' {
  interface Request {
    tenant?: {
      id: string;
      slug: string;
    };
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip middleware for auth routes
    if (req.path.startsWith('/api/v1/auth/')) {
      return next();
    }

    const host = req.headers.host || '';
    // Expecting subdomain.rootdomain[:port]
    const hostWithoutPort = host.split(':')[0];
    const parts = hostWithoutPort.split('.');

    // ENV ROOT_DOMAIN like "saas.com"; skip middleware in local direct calls without subdomain
    const rootDomain = process.env.ROOT_DOMAIN;
    if (!rootDomain) {
      throw new BadRequestException('ROOT_DOMAIN is not configured');
    }

    // If host ends with ROOT_DOMAIN and has a subdomain, extract it
    const rootParts = rootDomain.split('.');
    const endsWithRoot = rootParts.every((part, idx) => parts[parts.length - rootParts.length + idx] === part);

    let subdomain: string | null = null;
    if (endsWithRoot && parts.length > rootParts.length) {
      subdomain = parts.slice(0, parts.length - rootParts.length).join('.');
    }

    // If no subdomain (e.g., hitting via localhost or root domain), allow through without tenant
    if (!subdomain) {
      return next();
    }

    try {
      const company = await this.prisma.company.findFirst({
        where: {
          OR: [{ slug: subdomain }, { domain: hostWithoutPort }],
          isActive: true,
        },
        select: { id: true, slug: true },
      });

      if (!company) {
        throw new NotFoundException('Empresa não encontrada para o subdomínio');
      }

      req.tenant = { id: company.id, slug: company.slug };
      return next();
    } catch (err) {
      return next(err);
    }
  }
}


