import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';

export interface WorkspaceUsageAlertRecord {
  id: string;
  workspace_id: string;
  metric: string;
  threshold: number;
  condition: string;
  window: string;
  channel: string;
  enabled: boolean;
  created_by: string | null;
  metadata: Record<string, unknown>;
  last_triggered_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class WorkspaceUsageAlertsRepository {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  async listByWorkspace(workspaceId: string): Promise<WorkspaceUsageAlertRecord[]> {
    const result = await this.pool.query<WorkspaceUsageAlertRecord>(
      `
        SELECT id,
               workspace_id,
               metric,
               threshold,
               condition,
               window_size AS window,
               channel,
               enabled,
               created_by,
               metadata,
               last_triggered_at,
               created_at,
               updated_at
          FROM workspace_usage_alerts
         WHERE workspace_id = $1
         ORDER BY created_at DESC
      `,
      [workspaceId],
    );

    return result.rows;
  }

  async createAlert(params: {
    workspaceId: string;
    metric: string;
    threshold: number;
    condition: string;
    window?: string;
    channel?: string;
    createdBy?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<WorkspaceUsageAlertRecord> {
    const result = await this.pool.query<WorkspaceUsageAlertRecord>(
      `
        INSERT INTO workspace_usage_alerts (
          workspace_id,
          metric,
          threshold,
          condition,
          window_size,
          channel,
          created_by,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
        RETURNING id,
                  workspace_id,
                  metric,
                  threshold,
                  condition,
                  window_size AS window,
                  channel,
                  enabled,
                  created_by,
                  metadata,
                  last_triggered_at,
                  created_at,
                  updated_at
      `,
      [
        params.workspaceId,
        params.metric,
        params.threshold,
        params.condition,
        params.window ?? '24h',
        params.channel ?? 'email',
        params.createdBy ?? null,
        JSON.stringify(params.metadata ?? {}),
      ],
    );

    return result.rows[0];
  }

  async setEnabled(alertId: string, enabled: boolean): Promise<void> {
    await this.pool.query(
      `
        UPDATE workspace_usage_alerts
           SET enabled = $2,
               updated_at = NOW()
         WHERE id = $1
      `,
      [alertId, enabled],
    );
  }

  async deleteAlert(alertId: string): Promise<void> {
    await this.pool.query(
      `
        DELETE FROM workspace_usage_alerts
         WHERE id = $1
      `,
      [alertId],
    );
  }

  async touchTriggered(alertId: string): Promise<void> {
    await this.pool.query(
      `
        UPDATE workspace_usage_alerts
           SET last_triggered_at = NOW(),
               updated_at = NOW()
         WHERE id = $1
      `,
      [alertId],
    );
  }
}
