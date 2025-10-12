import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';

export interface WebhookRegistrationRecord {
  id: string;
  user_id: string;
  token_hash: string;
  status: string;
  created_at: Date;
  verified_at: Date | null;
  revoked_at: Date | null;
  last_used_at: Date | null;
}

@Injectable()
export class WebhookRegistrationsRepository {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  async createRegistration(params: {
    userId: string;
    tokenHash: string;
  }): Promise<WebhookRegistrationRecord> {
    const result = await this.pool.query<WebhookRegistrationRecord>(
      `
        INSERT INTO webhook_registrations (user_id, token_hash)
        VALUES ($1, $2)
        ON CONFLICT (token_hash) DO NOTHING
        RETURNING id,
                  user_id,
                  token_hash,
                  status,
                  created_at,
                  verified_at,
                  revoked_at,
                  last_used_at
      `,
      [params.userId, params.tokenHash],
    );

    if (!result.rowCount) {
      throw new Error('Token hash already exists');
    }

    return result.rows[0];
  }

  async findActiveByTokenHash(
    tokenHash: string,
  ): Promise<WebhookRegistrationRecord | null> {
    const result = await this.pool.query<WebhookRegistrationRecord>(
      `
        SELECT id,
               user_id,
               token_hash,
               status,
               created_at,
               verified_at,
               revoked_at,
               last_used_at
        FROM webhook_registrations
        WHERE token_hash = $1
          AND status = 'active'
        LIMIT 1
      `,
      [tokenHash],
    );

    return result.rows[0] ?? null;
  }

  async markVerified(id: string): Promise<void> {
    await this.pool.query(
      `
        UPDATE webhook_registrations
        SET verified_at = NOW()
        WHERE id = $1
      `,
      [id],
    );
  }

  async updateLastUsedAt(id: string): Promise<void> {
    await this.pool.query(
      `
        UPDATE webhook_registrations
        SET last_used_at = NOW()
        WHERE id = $1
      `,
      [id],
    );
  }
}
