"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
exports.validateEnv = validateEnv;
const zod_1 = require("zod");
const optionalUrl = zod_1.z
    .union([zod_1.z.string().url(), zod_1.z.literal(''), zod_1.z.undefined()])
    .transform((value) => (value ? value : undefined));
exports.envSchema = zod_1.z
    .object({
    NODE_ENV: zod_1.z
        .enum(['development', 'test', 'production'])
        .default('development'),
    PORT: zod_1.z.coerce.number().int().positive().max(65535).default(3000),
    BASE_URL: optionalUrl,
    RECEIVING_BASE_PATH: zod_1.z.string().trim().default('/webhooks'),
    DATABASE_URL: zod_1.z.string().url(),
    PG_POOL_MAX: zod_1.z.coerce.number().int().positive().default(10),
    PG_IDLE_TIMEOUT_MS: zod_1.z.coerce.number().int().nonnegative().default(30000),
    PG_SSL: zod_1.z
        .enum(['true', 'false'])
        .default('false')
        .transform((value) => value === 'true'),
    TOKEN_HASH_SECRET: zod_1.z.string().min(6),
    VERIFY_TOKEN: zod_1.z.string().default('SET_VERIFY_TOKEN'),
    APP_SECRET: zod_1.z.string().optional(),
    JWT_SECRET: zod_1.z.string().min(6),
    JWT_EXPIRES_IN: zod_1.z.string().default('12h'),
    SIGNUP_ACCESS_TOKEN: zod_1.z.string().optional(),
    RATE_LIMIT_WINDOW_MS: zod_1.z.coerce.number().int().positive().default(60_000),
    RATE_LIMIT_MAX: zod_1.z.coerce.number().int().positive().default(120),
    CORS_ORIGINS: zod_1.z.string().optional(),
    BCRYPT_SALT_ROUNDS: zod_1.z.coerce.number().int().positive().default(10),
    REDIS_URL: optionalUrl,
    REDIS_HOST: zod_1.z.string().trim().min(1).default('127.0.0.1'),
    REDIS_PORT: zod_1.z.coerce.number().int().positive().default(6379),
    REDIS_USERNAME: zod_1.z.string().optional(),
    REDIS_PASSWORD: zod_1.z.string().optional(),
    SENTRY_DSN: optionalUrl,
    LOG_LEVEL: zod_1.z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.coerce.number().int().positive().optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASSWORD: zod_1.z.string().optional(),
    SMTP_FROM: zod_1.z.string().email().optional(),
    AWS_ACCESS_KEY_ID: zod_1.z.string().optional(),
    AWS_SECRET_ACCESS_KEY: zod_1.z.string().optional(),
    AWS_REGION: zod_1.z.string().default('us-east-1'),
    AWS_S3_BUCKET: zod_1.z.string().optional(),
    WHATSAPP_SESSION_PATH: zod_1.z.string().optional(),
    WHATSAPP_LEAD_ALERT_PHONE: zod_1.z.string().optional(),
    ENABLE_SWAGGER: zod_1.z.enum(['true', 'false']).default('true').transform(val => val === 'true'),
    ENABLE_METRICS: zod_1.z.enum(['true', 'false']).default('true').transform(val => val === 'true'),
    MCP_SERVER_URL: optionalUrl,
    MCP_API_KEY: zod_1.z.string().optional(),
})
    .passthrough();
function validateEnv(config) {
    const parsed = exports.envSchema.safeParse(config);
    if (!parsed.success) {
        const formatted = parsed.error.issues
            .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
            .join('; ');
        throw new Error(`Invalid environment configuration: ${formatted}`);
    }
    return parsed.data;
}
//# sourceMappingURL=env.validation.js.map