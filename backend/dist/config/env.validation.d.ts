import { z } from 'zod';
export declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        test: "test";
        production: "production";
    }>>;
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    BASE_URL: z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">, z.ZodUndefined]>, z.ZodTransform<string | undefined, string | undefined>>;
    RECEIVING_BASE_PATH: z.ZodDefault<z.ZodString>;
    DATABASE_URL: z.ZodString;
    PG_POOL_MAX: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    PG_IDLE_TIMEOUT_MS: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    PG_SSL: z.ZodPipe<z.ZodDefault<z.ZodEnum<{
        true: "true";
        false: "false";
    }>>, z.ZodTransform<boolean, "true" | "false">>;
    TOKEN_HASH_SECRET: z.ZodString;
    VERIFY_TOKEN: z.ZodDefault<z.ZodString>;
    APP_SECRET: z.ZodOptional<z.ZodString>;
    JWT_SECRET: z.ZodString;
    JWT_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    SIGNUP_ACCESS_TOKEN: z.ZodOptional<z.ZodString>;
    RATE_LIMIT_WINDOW_MS: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    RATE_LIMIT_MAX: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    CORS_ORIGINS: z.ZodOptional<z.ZodString>;
    BCRYPT_SALT_ROUNDS: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    REDIS_URL: z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">, z.ZodUndefined]>, z.ZodTransform<string | undefined, string | undefined>>;
    REDIS_PASSWORD: z.ZodOptional<z.ZodString>;
    SENTRY_DSN: z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">, z.ZodUndefined]>, z.ZodTransform<string | undefined, string | undefined>>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<{
        error: "error";
        debug: "debug";
        info: "info";
        warn: "warn";
    }>>;
    SMTP_HOST: z.ZodOptional<z.ZodString>;
    SMTP_PORT: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    SMTP_USER: z.ZodOptional<z.ZodString>;
    SMTP_PASSWORD: z.ZodOptional<z.ZodString>;
    SMTP_FROM: z.ZodOptional<z.ZodString>;
    AWS_ACCESS_KEY_ID: z.ZodOptional<z.ZodString>;
    AWS_SECRET_ACCESS_KEY: z.ZodOptional<z.ZodString>;
    AWS_REGION: z.ZodDefault<z.ZodString>;
    AWS_S3_BUCKET: z.ZodOptional<z.ZodString>;
    ENABLE_SWAGGER: z.ZodPipe<z.ZodDefault<z.ZodEnum<{
        true: "true";
        false: "false";
    }>>, z.ZodTransform<boolean, "true" | "false">>;
    ENABLE_METRICS: z.ZodPipe<z.ZodDefault<z.ZodEnum<{
        true: "true";
        false: "false";
    }>>, z.ZodTransform<boolean, "true" | "false">>;
    MCP_SERVER_URL: z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">, z.ZodUndefined]>, z.ZodTransform<string | undefined, string | undefined>>;
    MCP_API_KEY: z.ZodOptional<z.ZodString>;
}, z.core.$loose>;
export type AppConfig = z.infer<typeof envSchema>;
export declare function validateEnv(config: Record<string, unknown>): AppConfig;
