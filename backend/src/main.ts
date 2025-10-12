import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { json, type Request } from 'express';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AppConfig } from './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(PinoLogger));

  app.use(
    json({
      verify: (req: Request & { rawBody?: Buffer }, _res, buf) => {
        if (Buffer.isBuffer(buf)) {
          req.rawBody = Buffer.from(buf);
        }
      },
    }),
  );

  const config = app.get(ConfigService<AppConfig, true>);
  const logger = app.get(PinoLogger);

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

  const corsOrigins = config.get('CORS_ORIGINS', { infer: true }) || '';
  const allowedOrigins = corsOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.length === 0) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(
        new Error(`Origin ${origin} not allowed by CORS policy`),
        false,
      );
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false,
  });

  const port = config.get('PORT', { infer: true });
  const baseUrl =
    config.get('BASE_URL', { infer: true }) ?? `http://localhost:${port}`;

  await app.listen(port);
  logger.log(`API ready at ${baseUrl}/api`);
}

void bootstrap();
