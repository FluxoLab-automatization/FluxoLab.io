import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';

export interface WorkspaceApiKeyAuditRecord {
  id: string;
  api_key_id: string;
  workspace_id: string;
  action: 'created' | 'rotated' | 'revoked' | 'used';
  actor_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  occurred_at: Date;
}

@Injectable()
export class WorkspaceApiKeyAuditRepository {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  async recordEvent(params: {
    apiKeyId: string;
    workspaceId: string;
    action: 'created' | 'rotated' | 'revoked' | 'used';
    actorId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.pool.query(
      `
        INSERT INTO workspace_api_key_audit (
          api_key_id,
          workspace_id,
          action,
          actor_id,
          ip_address,
          user_agent,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
      `,
      [
        params.apiKeyId,
        params.workspaceId,
        params.action,
        params.actorId ?? null,
        params.ipAddress ?? null,
        params.userAgent ?? null,
        JSON.stringify(params.metadata ?? {}),
      ],
    );
  }

  async listRecent(
    workspaceId: string,
    apiKeyId: string,
    limit = 50,
  ): Promise<WorkspaceApiKeyAuditRecord[]> {
    const result = await this.pool.query<WorkspaceApiKeyAuditRecord>(
      `
        SELECT id,
               api_key_id,
               workspace_id,
               action,
               actor_id,
               ip_address,
               user_agent,
               metadata,
               occurred_at
          FROM workspace_api_key_audit
         WHERE workspace_id = $1
           AND api_key_id = $2
         ORDER BY occurred_at DESC
         LIMIT $3
      `,
      [workspaceId, apiKeyId, limit],
    );

    return result.rows;
  }
}
