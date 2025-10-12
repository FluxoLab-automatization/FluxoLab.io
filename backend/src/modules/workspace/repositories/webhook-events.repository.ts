import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';

export interface WebhookEventRecord {
  id: string;
  registration_id: string;
  event_type: string | null;
  status: string;
  signature_valid: boolean;
  received_at: Date;
}

@Injectable()
export class WorkspaceWebhookRepository {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  async countRegistrations(): Promise<number> {
    const result = await this.pool.query<{ total: number }>(
      `
        SELECT COUNT(*)::int AS total
        FROM webhook_registrations
      `,
    );
    return result.rows[0]?.total ?? 0;
  }

  async countEvents(): Promise<number> {
    const result = await this.pool.query<{ total: number }>(
      `
        SELECT COUNT(*)::int AS total
        FROM webhook_events
      `,
    );
    return result.rows[0]?.total ?? 0;
  }

  async listRecentEvents(limit: number): Promise<WebhookEventRecord[]> {
    const result = await this.pool.query<WebhookEventRecord>(
      `
        SELECT id,
               registration_id,
               event_type,
               status,
               signature_valid,
               received_at
        FROM webhook_events
        ORDER BY received_at DESC
        LIMIT $1
      `,
      [limit],
    );

    return result.rows;
  }
}
