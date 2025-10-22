"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const throttler_1 = require("@nestjs/throttler");
const config_2 = require("@nestjs/config");
const bull_1 = require("@nestjs/bull");
const env_validation_1 = require("./config/env.validation");
const auth_module_1 = require("./modules/auth/auth.module");
const workspace_module_1 = require("./modules/workspace/workspace.module");
const webhooks_module_1 = require("./modules/webhooks/webhooks.module");
const database_module_1 = require("./shared/database/database.module");
const security_module_1 = require("./shared/security/security.module");
const monitoring_module_1 = require("./modules/monitoring/monitoring.module");
const mcp_module_1 = require("./modules/mcp/mcp.module");
const workflows_module_1 = require("./modules/workflows/workflows.module");
const app_controller_1 = require("./app.controller");
const leads_module_1 = require("./modules/leads/leads.module");
const whatsapp_module_1 = require("./modules/whatsapp/whatsapp.module");
const ai_module_1 = require("./modules/ai/ai.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const users_module_1 = require("./modules/users/users.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                cache: true,
                envFilePath: ['.env', '../.env'],
                validate: env_validation_1.validateEnv,
            }),
            nestjs_pino_1.LoggerModule.forRootAsync({
                useFactory: () => ({
                    pinoHttp: {
                        level: process.env.LOG_LEVEL || 'info',
                        transport: process.env.NODE_ENV === 'production' ||
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
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_2.ConfigService],
                useFactory: (config) => [
                    {
                        ttl: config.get('RATE_LIMIT_WINDOW_MS', { infer: true }) / 1000,
                        limit: config.get('RATE_LIMIT_MAX', { infer: true }),
                    },
                ],
            }),
            bull_1.BullModule.forRootAsync({
                inject: [config_2.ConfigService],
                useFactory: (config) => {
                    const redisUrl = config.get('REDIS_URL', { infer: true });
                    const fallbackHost = config.get('REDIS_HOST', { infer: true });
                    const fallbackPort = config.get('REDIS_PORT', { infer: true });
                    const username = config.get('REDIS_USERNAME', { infer: true }) || undefined;
                    const password = config.get('REDIS_PASSWORD', { infer: true }) || undefined;
                    const buildFromUrl = (url) => {
                        const parsed = new URL(url);
                        const options = {
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
                    const redisOptions = redisUrl
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
            database_module_1.DatabaseModule,
            security_module_1.SecurityModule,
            auth_module_1.AuthModule,
            workspace_module_1.WorkspaceModule,
            webhooks_module_1.WebhooksModule,
            monitoring_module_1.MonitoringModule,
            mcp_module_1.McpModule,
            workflows_module_1.WorkflowsModule,
            leads_module_1.LeadsModule,
            whatsapp_module_1.WhatsappModule,
            ai_module_1.AiModule,
            dashboard_module_1.DashboardModule,
            users_module_1.UsersModule,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map