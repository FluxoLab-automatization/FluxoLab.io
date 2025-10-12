import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';

export interface UserSettingsRecord {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  locale: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  notifications: Record<string, unknown> | null;
  preferences: Record<string, unknown> | null;
  updated_at: Date;
}

@Injectable()
export class UserSettingsRepository {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  async ensureUserSettings(params: {
    userId: string;
    firstName?: string | null;
    lastName?: string | null;
  }): Promise<void> {
    await this.pool.query(
      `
        INSERT INTO user_settings (user_id, first_name, last_name)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO UPDATE
           SET first_name = COALESCE(EXCLUDED.first_name, user_settings.first_name),
               last_name = COALESCE(EXCLUDED.last_name, user_settings.last_name),
               updated_at = NOW()
      `,
      [params.userId, params.firstName ?? null, params.lastName ?? null],
    );
  }
}
