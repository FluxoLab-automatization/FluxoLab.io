"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const express_1 = require("express");
const nestjs_pino_1 = require("nestjs-pino");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    app.use((0, express_1.json)({
        verify: (req, _res, buf) => {
            req.rawBody = Buffer.from(buf);
        },
    }));
    const config = app.get((config_1.ConfigService));
    const logger = app.get(nestjs_pino_1.Logger);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const corsOrigins = config.get('CORS_ORIGINS', { infer: true }) || '';
    const allowedOrigins = corsOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.length === 0) {
                return callback(null, true);
            }
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error(`Origin ${origin} not allowed by CORS policy`), false);
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: false,
    });
    const port = config.get('PORT', { infer: true });
    const baseUrl = config.get('BASE_URL', { infer: true }) ?? `http://localhost:${port}`;
    await app.listen(port);
    logger.log(`API ready at ${baseUrl}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map