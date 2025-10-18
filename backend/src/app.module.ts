import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { AppConfig, validateEnv } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { DatabaseModule } from './shared/database/database.module';
import { SecurityModule } from './shared/security/security.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { McpModule } from './modules/mcp/mcp.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env', '../.env'],
      validate: validateEnv,
    }),
    LoggerModule.forRootAsync({
      useFactory: () => ({
        pinoHttp: {
          level: process.env.LOG_LEVEL || 'info',
          transport:
            process.env.NODE_ENV === 'production' ||
            process.env.PINO_PRETTY === 'false'
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                  },
                },
        },
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => [
        {
          ttl: config.get('RATE_LIMIT_WINDOW_MS', { infer: true }) / 1000,
          limit: config.get('RATE_LIMIT_MAX', { infer: true }),
        },
      ],
    }),
    DatabaseModule,
    SecurityModule,
    AuthModule,
    WorkspaceModule,
    WebhooksModule,
    MonitoringModule,
    McpModule,
    WorkflowsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
