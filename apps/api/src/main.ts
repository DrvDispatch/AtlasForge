// Load environment variables from monorepo root BEFORE any imports that use them
import * as dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, '../../../.env') });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3001);
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');

    // Cookie parser for session handling
    app.use(cookieParser());

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

    // CORS
    app.enableCors({
        origin: true, // Configure properly in production
        credentials: true,
    });

    // API prefix
    app.setGlobalPrefix('api', {
        exclude: ['health', 'webhooks/(.*)'],
    });

    // Swagger documentation
    if (nodeEnv !== 'production') {
        const swaggerConfig = new DocumentBuilder()
            .setTitle('AtlasForge API')
            .setDescription('A modular, business-agnostic backend platform')
            .setVersion('1.0')
            .addBearerAuth()
            .addTag('core', 'Core platform endpoints')
            .addTag('auth', 'Authentication & authorization')
            .addTag('tenants', 'Tenant management')
            .addTag('users', 'User management')
            .addTag('owner', 'Platform owner endpoints')
            .build();

        const document = SwaggerModule.createDocument(app, swaggerConfig);
        SwaggerModule.setup('docs', app, document);
        logger.log(`Swagger documentation available at /docs`);
    }

    await app.listen(port);
    logger.log(`🚀 AtlasForge API running on port ${port} [${nodeEnv}]`);
    logger.log(`📚 API docs: http://localhost:${port}/docs`);
}

bootstrap();
