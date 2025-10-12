import { z } from 'zod';
export declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        test: "test";
        production: "production";
    }>>;
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    BASE_URL: z.ZodOptional<z.ZodString>;
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
}, z.core.$loose>;
export type AppConfig = z.infer<typeof envSchema>;
export declare function validateEnv(config: Record<string, unknown>): AppConfig;
