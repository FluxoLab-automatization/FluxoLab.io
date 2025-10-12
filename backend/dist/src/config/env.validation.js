"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
exports.validateEnv = validateEnv;
const zod_1 = require("zod");
exports.envSchema = zod_1.z
    .object({
    NODE_ENV: zod_1.z
        .enum(['development', 'test', 'production'])
        .default('development'),
    PORT: zod_1.z.coerce.number().int().positive().max(65535).default(3000),
    BASE_URL: zod_1.z.string().url().optional(),
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