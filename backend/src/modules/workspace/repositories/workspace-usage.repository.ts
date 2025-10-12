import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';

interface UsageSnapshotRow {
  id: string;
  workspace_id: string;
  period_start: string;
  period_end: string;
  workflows_active: number;
  users_active: number;
  webhook_events: number;
  metadata: Record<string, unknown> | null;
  created_at: Date;
}

export interface WorkspaceUsageSnapshot {
  workspaceId: string;
  periodStart: string;
  periodEnd: string;
  workflowsActive: number;
  usersActive: number;
  webhookEvents: number;
  collectedAt: string;
  metadata: Record<string, unknown>;
}

@Injectable()
export class WorkspaceUsageRepository {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  async getLatestSnapshot(
    workspaceId: string,
  ): Promise<WorkspaceUsageSnapshot | null> {
    const result = await this.pool.query<UsageSnapshotRow>(
      `
        SELECT id,
               workspace_id,
               period_start::text,
               period_end::text,
               workflows_active,
               users_active,
               webhook_events,
               metadata,
               created_at
          FROM workspace_usage_snapshots
         WHERE workspace_id = $1
         ORDER BY period_end DESC, created_at DESC
         LIMIT 1
      `,
      [workspaceId],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      workspaceId: row.workspace_id,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      workflowsActive: row.workflows_active,
      usersActive: row.users_active,
      webhookEvents: row.webhook_events,
      collectedAt: row.created_at.toISOString(),
      metadata: row.metadata ?? {},
    };
  }
}
