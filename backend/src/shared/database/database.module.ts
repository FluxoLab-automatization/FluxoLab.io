import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { AppConfig } from '../../config/env.validation';
import { PG_POOL } from './database.constants';
import { DatabaseService } from './database.service';

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => {
        const pool = new Pool({
          connectionString: config.get('DATABASE_URL', { infer: true }),
          max: config.get('PG_POOL_MAX', { infer: true }),
          idleTimeoutMillis: config.get('PG_IDLE_TIMEOUT_MS', { infer: true }),
          ssl: config.get('PG_SSL', { infer: true })
            ? { rejectUnauthorized: false }
            : undefined,
        });

        pool.on('error', (err: Error) => {
          console.error('Unexpected Postgres pool error', err);
        });

        return pool;
      },
    },
    DatabaseService,
  ],
  exports: [PG_POOL, DatabaseService],
})
export class DatabaseModule {}
