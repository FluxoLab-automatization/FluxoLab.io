import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';

export interface WorkspaceApiKeyRecord {
  id: string;
  workspace_id: string;
  label: string;
  key_hash?: string;
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

  async findById(
    workspaceId: string,
    apiKeyId: string,
  ): Promise<WorkspaceApiKeyRecord | null> {
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
           AND k.id = $2
         LIMIT 1
      `,
      [workspaceId, apiKeyId],
    );

    const row = result.rows[0];
    return row ?? null;
  }

  async createKey(params: {
    workspaceId: string;
    label: string;
    keyHash: string;
    keyPreview: string;
    scopes: string[];
    createdBy?: string | null;
    metadata?: Record<string, unknown>;
    expiresAt?: Date | null;
  }): Promise<WorkspaceApiKeyRecord> {
    const result = await this.pool.query<WorkspaceApiKeyRecord>(
      `
        INSERT INTO workspace_api_keys (
          workspace_id,
          label,
          key_hash,
          key_preview,
          scopes,
          created_by,
          metadata,
          expires_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
        RETURNING id,
                  workspace_id,
                  label,
                  key_preview,
                  scopes,
                  status,
                  created_by,
                  metadata,
                  last_used_at,
                  expires_at,
                  revoked_at,
                  created_at,
                  updated_at
      `,
      [
        params.workspaceId,
        params.label,
        params.keyHash,
        params.keyPreview,
        params.scopes,
        params.createdBy ?? null,
        JSON.stringify(params.metadata ?? {}),
        params.expiresAt ?? null,
      ],
    );

    return result.rows[0];
  }

  async revokeKey(
    workspaceId: string,
    apiKeyId: string,
  ): Promise<void> {
    await this.pool.query(
      `
        UPDATE workspace_api_keys
           SET status = 'revoked',
               revoked_at = NOW(),
               updated_at = NOW()
         WHERE workspace_id = $1
           AND id = $2
      `,
      [workspaceId, apiKeyId],
    );
  }

  async updateKeySecret(params: {
    workspaceId: string;
    apiKeyId: string;
    keyHash: string;
    keyPreview: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.pool.query(
      `
        UPDATE workspace_api_keys
           SET key_hash = $3,
               key_preview = $4,
               metadata = workspace_api_keys.metadata || $5::jsonb,
               updated_at = NOW()
         WHERE workspace_id = $1
           AND id = $2
      `,
      [
        params.workspaceId,
        params.apiKeyId,
        params.keyHash,
        params.keyPreview,
        JSON.stringify(params.metadata ?? {}),
      ],
    );
  }
}
