import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';

interface WorkspaceSettingsRow {
  workspace_id: string;
  preferences: Record<string, unknown> | null;
  notifications: Record<string, unknown> | null;
  branding: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

export interface WorkspaceSettings {
  workspaceId: string;
  preferences: Record<string, unknown>;
  notifications: Record<string, unknown>;
  branding: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class WorkspaceSettingsRepository {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  private mapRow(row: WorkspaceSettingsRow): WorkspaceSettings {
    return {
      workspaceId: row.workspace_id,
      preferences: row.preferences ?? {},
      notifications: row.notifications ?? {},
      branding: row.branding ?? {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async ensureDefaults(workspaceId: string): Promise<void> {
    await this.pool.query(
      `
        INSERT INTO workspace_settings (
          workspace_id,
          preferences,
          notifications,
          branding
        )
        VALUES (
          $1,
          jsonb_build_object('timezone', 'America/Sao_Paulo', 'language', 'pt-BR'),
          jsonb_build_object('email', true, 'push', false),
          jsonb_build_object('logo_url', NULL, 'theme', 'dark')
        )
        ON CONFLICT (workspace_id) DO NOTHING
      `,
      [workspaceId],
    );
  }

  async updatePreferences(
    workspaceId: string,
    preferences: Record<string, unknown>,
  ): Promise<WorkspaceSettings> {
    const result = await this.pool.query<WorkspaceSettingsRow>(
      `
        UPDATE workspace_settings
           SET preferences = workspace_settings.preferences || $2::jsonb,
               updated_at = NOW()
         WHERE workspace_id = $1
        RETURNING workspace_id,
                  preferences,
                  notifications,
                  branding,
                  created_at,
                  updated_at
      `,
      [workspaceId, JSON.stringify(preferences)],
    );

    return this.mapRow(result.rows[0]);
  }

  async findByWorkspaceId(
    workspaceId: string,
  ): Promise<WorkspaceSettings | null> {
    const result = await this.pool.query<WorkspaceSettingsRow>(
      `
        SELECT workspace_id,
               preferences,
               notifications,
               branding,
               created_at,
               updated_at
          FROM workspace_settings
         WHERE workspace_id = $1
         LIMIT 1
      `,
      [workspaceId],
    );

    const row = result.rows[0];
    return row ? this.mapRow(row) : null;
  }
}
