import { z } from 'zod';

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().positive().max(65535).default(3000),
    BASE_URL: z.string().url().optional(),
    RECEIVING_BASE_PATH: z.string().trim().default('/webhooks'),
    DATABASE_URL: z.string().url(),
    PG_POOL_MAX: z.coerce.number().int().positive().default(10),
    PG_IDLE_TIMEOUT_MS: z.coerce.number().int().nonnegative().default(30000),
    PG_SSL: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    TOKEN_HASH_SECRET: z.string().min(6),
    VERIFY_TOKEN: z.string().default('SET_VERIFY_TOKEN'),
    APP_SECRET: z.string().optional(),
    JWT_SECRET: z.string().min(6),
    JWT_EXPIRES_IN: z.string().default('12h'),
    SIGNUP_ACCESS_TOKEN: z.string().optional(),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
    CORS_ORIGINS: z.string().optional(),
    BCRYPT_SALT_ROUNDS: z.coerce.number().int().positive().default(10),
    
    // New configurations for improved features
    REDIS_URL: z.string().url().optional(),
    REDIS_PASSWORD: z.string().optional(),
    
    // Monitoring and observability
    SENTRY_DSN: z.string().url().optional(),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    
    // Email configuration
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM: z.string().email().optional(),
    
    // File storage
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().default('us-east-1'),
    AWS_S3_BUCKET: z.string().optional(),
    
    // Feature flags
    ENABLE_SWAGGER: z.enum(['true', 'false']).default('true').transform(val => val === 'true'),
    ENABLE_METRICS: z.enum(['true', 'false']).default('true').transform(val => val === 'true'),
    
    // MCP Configuration
    MCP_SERVER_URL: z.string().url().optional(),
    MCP_API_KEY: z.string().optional(),
  })
  .passthrough();

export type AppConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): AppConfig {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${formatted}`);
  }
  return parsed.data;
}
