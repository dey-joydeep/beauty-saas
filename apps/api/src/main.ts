import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from './config/config.service';
import { ConfigModule } from './config/config.module';
import { useContainer } from 'class-validator';
import { json, urlencoded } from 'express';
import morgan from 'morgan';
import { JwtAuthGuard } from './core/auth/guards/jwt-auth.guard';
import { RolesGuard } from './core/auth/guards/roles.guard';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Create the application with logging
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    bufferLogs: true,
  });

  // Get config service
  const configService = app.select(ConfigModule).get(ConfigService);
  const { port, nodeEnv, isProduction } = configService.app;
  const { origins, methods, allowedHeaders, exposedHeaders, credentials, maxAge } = configService.cors;
                    return callback(null, true);
                }
            } catch (e) {
                // If URL parsing fails, deny the request
                return callback(new Error('Invalid origin'));
            }
            
            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
        allowedHeaders: [
            'Content-Type', 
            'Authorization', 
            'X-Requested-With', 
            'Accept',
            'X-XSRF-TOKEN',
            'X-Request-Id'
        ],
        exposedHeaders: ['X-Request-Id'],
        maxAge: 600, // 10 minutes
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
