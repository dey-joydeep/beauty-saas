import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ClassSerializerInterceptor, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './core/auth/guards/jwt-auth.guard';
import { RolesGuard } from './core/auth/guards/roles.guard';

export async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3000);
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:4200');

    // Enable CORS
    app.enableCors({
        origin: corsOrigin.split(',').map(origin => origin.trim()),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Security middleware
    app.use(helmet.crossOriginResourcePolicy());

    // Request logging
    if (nodeEnv !== 'test') {
        app.use(morgan('dev'));
    }

    // Cookie parser
    app.use(cookieParser.default());

    // Global pipes, filters, guards, and interceptors
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
            forbidNonWhitelisted: true,
        }),
    );

    // Enable versioning
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });

    // Global filters
    app.useGlobalFilters(new HttpExceptionFilter());

    // Global guards
    const reflector = app.get(Reflector);
    app.useGlobalGuards(
        new JwtAuthGuard(reflector),
        new RolesGuard(reflector),
    );

    // Global interceptors
    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(reflector),
    );

    // Set global prefix for all routes
    app.setGlobalPrefix('api');

    // Setup Swagger documentation in non-production environments
    if (nodeEnv !== 'production') {
        const config = new DocumentBuilder()
            .setTitle('Beauty SaaS API')
            .setDescription('The Beauty SaaS API documentation')
            .setVersion('1.0')
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
            .addApiKey(
                {
                    type: 'apiKey',
                    name: 'x-api-key',
                    in: 'header',
                    description: 'API Key for external access',
                },
                'api-key',
            )
            .addCookieAuth('token')
            .addServer(process.env['API_URL'] || 'http://localhost:3000')
            .addServer('http://localhost:3000')
            .addBearerAuth()
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document);
    }

    // Start the application
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);

    if (nodeEnv !== 'production') {
        console.log(`API Documentation available at: http://localhost:${port}/api/docs`);
    }
}

// Start the application
if (process.env.NODE_ENV !== 'test') {
    bootstrap().catch(err => {
        console.error('Failed to start application:', err);
        process.exit(1);
    });
}
