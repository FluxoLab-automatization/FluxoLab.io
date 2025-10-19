import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';

export interface WorkspaceIntegrationEventRecord {
  id: string;
  workspace_id: string;
  integration_type: string;
  integration_id: string | null;
  status: string;
  payload: Record<string, unknown>;
  recorded_by: string | null;
  occurred_at: Date;
}

@Injectable()
export class WorkspaceIntegrationEventsRepository {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  async recordEvent(params: {
    workspaceId: string;
    integrationType: string;
    integrationId?: string | null;
    status: string;
    payload?: Record<string, unknown>;
    recordedBy?: string | null;
  }): Promise<void> {
    await this.pool.query(
      `
        INSERT INTO workspace_integration_events (
          workspace_id,
          integration_type,
          integration_id,
          status,
          payload,
          recorded_by
        )
        VALUES ($1, $2, $3, $4, $5::jsonb, $6)
      `,
      [
        params.workspaceId,
        params.integrationType,
        params.integrationId ?? null,
        params.status,
        JSON.stringify(params.payload ?? {}),
        params.recordedBy ?? null,
      ],
    );
  }

  async listRecent(
    workspaceId: string,
    limit = 50,
  ): Promise<WorkspaceIntegrationEventRecord[]> {
    const result = await this.pool.query<WorkspaceIntegrationEventRecord>(
      `
        SELECT id,
               workspace_id,
               integration_type,
               integration_id,
               status,
               payload,
               recorded_by,
               occurred_at
          FROM workspace_integration_events
         WHERE workspace_id = $1
         ORDER BY occurred_at DESC
         LIMIT $2
      `,
      [workspaceId, limit],
    );

    return result.rows;
  }
}
