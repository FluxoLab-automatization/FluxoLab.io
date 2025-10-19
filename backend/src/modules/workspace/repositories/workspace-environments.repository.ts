import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';

export interface EnvironmentRecord {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  environment_type: 'sandbox' | 'staging' | 'production' | 'custom';
  region: string | null;
  status: 'pending' | 'ready' | 'locked' | 'disabled';
  metadata: Record<string, unknown> | null;
  last_synced_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class WorkspaceEnvironmentsRepository {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  async ensureDefaultEnvironments(workspaceId: string): Promise<void> {
    await this.pool.query(
      `
        INSERT INTO workspace_environments (
          workspace_id,
          name,
          slug,
          environment_type,
          region,
          status,
          metadata
        )
        VALUES
          ($1, 'Sandbox', 'sandbox', 'sandbox', 'sa-east-1', 'ready', jsonb_build_object('seed', 'default')),
          ($1, 'Staging', 'staging', 'staging', 'us-east-1', 'pending', jsonb_build_object('seed', 'default')),
          ($1, 'Producao', 'producao', 'production', 'sa-east-1', 'locked', jsonb_build_object('seed', 'default'))
        ON CONFLICT (workspace_id, slug) DO NOTHING
      `,
      [workspaceId],
    );
  }

  async listByWorkspace(workspaceId: string): Promise<EnvironmentRecord[]> {
    const result = await this.pool.query<EnvironmentRecord>(
      `
        SELECT id,
               workspace_id,
               name,
               slug,
               environment_type,
               region,
               status,
               metadata,
               last_synced_at,
               created_at,
               updated_at
          FROM workspace_environments
         WHERE workspace_id = $1
         ORDER BY created_at ASC
      `,
      [workspaceId],
    );

    return result.rows;
  }

  async updateStatus(params: {
    workspaceId: string;
    environmentId: string;
    status: EnvironmentRecord['status'];
  }): Promise<EnvironmentRecord | null> {
    const result = await this.pool.query<EnvironmentRecord>(
      `
        UPDATE workspace_environments
           SET status = $3,
               updated_at = NOW()
         WHERE workspace_id = $1
           AND id = $2
        RETURNING id,
                  workspace_id,
                  name,
                  slug,
                  environment_type,
                  region,
                  status,
                  metadata,
                  last_synced_at,
                  created_at,
                  updated_at
      `,
      [params.workspaceId, params.environmentId, params.status],
    );

    return result.rows[0] ?? null;
  }
}
