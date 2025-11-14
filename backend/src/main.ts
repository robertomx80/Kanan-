import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      configService.get('APP_URL'),
    ].filter(Boolean),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Price Tracking API')
    .setDescription(
      'API completa para el sistema de seguimiento de precios de productos en tiendas mexicanas',
    )
    .setVersion('1.0')
    .addTag('auth', 'Autenticación y autorización')
    .addTag('users', 'Gestión de usuarios')
    .addTag('products', 'Catálogo de productos')
    .addTag('prices', 'Historial de precios')
    .addTag('tracking', 'Tracking de productos')
    .addTag('subscriptions', 'Gestión de suscripciones')
    .addTag('notifications', 'Sistema de notificaciones')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = configService.get('BACKEND_PORT', 3001);
  await app.listen(port);

  console.log(`
  🚀 Application is running on: http://localhost:${port}
  📚 API Documentation: http://localhost:${port}/api/docs
  🔥 Environment: ${configService.get('NODE_ENV')}
  `);
}

bootstrap();
