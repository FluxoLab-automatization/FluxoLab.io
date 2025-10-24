import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import type { RedisOptions } from 'ioredis';
import { AppConfig, validateEnv } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { DatabaseModule } from './shared/database/database.module';
import { SecurityModule } from './shared/security/security.module';
import { MailModule } from './shared/mail/mail.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { McpModule } from './modules/mcp/mcp.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { AppController } from './app.controller';
import { LeadsModule } from './modules/leads/leads.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { AiModule } from './modules/ai/ai.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { UsersModule } from './modules/users/users.module';
import { VariablesModule } from './modules/variables/variables.module';
import { TagsModule } from './modules/tags/tags.module';
import { AiChatModule } from './modules/ai-chat/ai-chat.module';
import { SupportModule } from './modules/support/support.module';
import { ProjectSharingModule } from './modules/project-sharing/project-sharing.module';
import { EngineModule } from './modules/engine/engine.module';
import { ConnectorsModule } from './modules/connectors/connectors.module';
import { TemplatesModule } from './modules/templates/templates.module';

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
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => {
        const redisUrl = config.get('REDIS_URL', { infer: true });
        const fallbackHost = config.get('REDIS_HOST', { infer: true });
        const fallbackPort = config.get('REDIS_PORT', { infer: true });
        const username =
          config.get('REDIS_USERNAME', { infer: true }) || undefined;
        const password =
          config.get('REDIS_PASSWORD', { infer: true }) || undefined;

        const buildFromUrl = (url: string): RedisOptions => {
          const parsed = new URL(url);
          const options: RedisOptions = {
            host: parsed.hostname || fallbackHost,
            port: parsed.port ? Number(parsed.port) : fallbackPort,
            password: parsed.password || password,
            username: parsed.username || username,
          };

          if (parsed.protocol === 'rediss:') {
            options.tls = {};
          }

          return options;
        };

        const redisOptions: RedisOptions = redisUrl
          ? buildFromUrl(redisUrl)
          : {
              host: fallbackHost,
              port: fallbackPort,
              username,
              password,
            };

        return {
          redis: redisOptions,
        };
      },
    }),
    DatabaseModule,
    SecurityModule,
    MailModule,
    AuthModule,
    WorkspaceModule,
    WebhooksModule,
    MonitoringModule,
    McpModule,
    WorkflowsModule,
    LeadsModule,
    WhatsappModule,
    AiModule,
    DashboardModule,
    UsersModule,
    VariablesModule,
    TagsModule,
    AiChatModule,
    SupportModule,
    ProjectSharingModule,
    EngineModule,
    ConnectorsModule,
    TemplatesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
