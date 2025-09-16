import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration - Allow all localhost subdomains
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://empresa1.localhost:3000',
      'http://empresa2.localhost:3000',
      'http://empresa3.localhost:3000',
      'http://demo.localhost:3000',
      'http://test.localhost:3000',
      /^http:\/\/.*\.localhost:3000$/, // Allow any subdomain.localhost:3000
    ],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  const port = configService.get('PORT', 3001);
  await app.listen(port);

  console.log(`🚀 Servify API running on: http://localhost:${port}/api/v1`);
}

bootstrap();
