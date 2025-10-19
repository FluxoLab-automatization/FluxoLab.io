import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';

export interface WebhookEventRecord {
  id: string;
  webhook_id: string;
  http_method: string;
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

  async countRegistrations(workspaceId: string): Promise<number> {
    const result = await this.pool.query<{ total: number }>(
      `
        SELECT COUNT(*)::int AS total
        FROM webhook_registrations
        WHERE workspace_id = $1
      `,
      [workspaceId],
    );
    return result.rows[0]?.total ?? 0;
  }

  async countEvents(workspaceId: string): Promise<number> {
    const result = await this.pool.query<{ total: number }>(
      `
        SELECT COUNT(*)::int AS total
        FROM webhook_events
        WHERE workspace_id = $1
      `,
      [workspaceId],
    );
    return result.rows[0]?.total ?? 0;
  }

  async listRecentEvents(workspaceId: string, limit: number): Promise<WebhookEventRecord[]> {
    const result = await this.pool.query<WebhookEventRecord>(
      `
        SELECT id,
               webhook_id,
               http_method,
               status,
               (signature IS NOT NULL) AS signature_valid,
               received_at
        FROM webhook_events
        WHERE workspace_id = $1
        ORDER BY received_at DESC
        LIMIT $2
      `,
      [workspaceId, limit],
    );

    return result.rows;
  }
}
