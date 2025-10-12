import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';

interface WorkspaceMemberRow {
  id: string;
  workspace_id: string;
  user_id: string;
  profile_id: string;
  invited_by: string | null;
  status: 'invited' | 'active' | 'suspended' | 'removed';
  joined_at: Date | null;
  left_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  profileId: string;
  invitedBy: string | null;
  status: 'invited' | 'active' | 'suspended' | 'removed';
  joinedAt: Date | null;
  leftAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class WorkspaceMembersRepository {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  private mapRow(row: WorkspaceMemberRow): WorkspaceMember {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      userId: row.user_id,
      profileId: row.profile_id,
      invitedBy: row.invited_by,
      status: row.status,
      joinedAt: row.joined_at,
      leftAt: row.left_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async addOrActivateMember(params: {
    workspaceId: string;
    userId: string;
    profileId: string;
    invitedBy?: string | null;
  }): Promise<WorkspaceMember> {
    const result = await this.pool.query<WorkspaceMemberRow>(
      `
        INSERT INTO workspace_members (
          workspace_id,
          user_id,
          profile_id,
          invited_by,
          status,
          joined_at
        )
        VALUES ($1, $2, $3, $4, 'active', NOW())
        ON CONFLICT (workspace_id, user_id) DO UPDATE
           SET profile_id = EXCLUDED.profile_id,
               invited_by = EXCLUDED.invited_by,
               status = 'active',
               joined_at = COALESCE(workspace_members.joined_at, NOW()),
               left_at = NULL,
               updated_at = NOW()
        RETURNING id,
                  workspace_id,
                  user_id,
                  profile_id,
                  invited_by,
                  status,
                  joined_at,
                  left_at,
                  created_at,
                  updated_at
      `,
      [
        params.workspaceId,
        params.userId,
        params.profileId,
        params.invitedBy ?? null,
      ],
    );

    return this.mapRow(result.rows[0]);
  }

  async countActive(workspaceId: string): Promise<number> {
    const result = await this.pool.query<{ total: number }>(
      `
        SELECT COUNT(*)::int AS total
          FROM workspace_members
         WHERE workspace_id = $1
           AND status = 'active'
      `,
      [workspaceId],
    );

    return result.rows[0]?.total ?? 0;
  }
}
