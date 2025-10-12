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
