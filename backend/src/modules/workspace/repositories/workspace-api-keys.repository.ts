import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';

export interface WorkspaceApiKeyRecord {
  id: string;
  workspace_id: string;
  label: string;
  key_preview: string;
  scopes: string[];
  status: 'active' | 'revoked' | 'expired';
  created_by: string | null;
  created_by_email: string | null;
  metadata: Record<string, unknown> | null;
  last_used_at: Date | null;
  expires_at: Date | null;
  revoked_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class WorkspaceApiKeysRepository {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  async listActive(workspaceId: string): Promise<WorkspaceApiKeyRecord[]> {
    const result = await this.pool.query<WorkspaceApiKeyRecord>(
      `
        SELECT k.id,
               k.workspace_id,
               k.label,
               k.key_preview,
               k.scopes,
               k.status,
               k.created_by,
               u.email AS created_by_email,
               k.metadata,
               k.last_used_at,
               k.expires_at,
               k.revoked_at,
               k.created_at,
               k.updated_at
          FROM workspace_api_keys k
          LEFT JOIN users u ON u.id = k.created_by
         WHERE k.workspace_id = $1
         ORDER BY k.created_at DESC
      `,
      [workspaceId],
    );

    return result.rows;
  }
}
