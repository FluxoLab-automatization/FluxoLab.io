import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';

export interface ActivityRecord {
  id: string;
  workspace_id: string;
  user_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  metadata: Record<string, unknown> | null;
  created_at: Date;
}

@Injectable()
export class ActivitiesRepository {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  async listRecentByUser(
    workspaceId: string,
    userId: string,
    limit: number,
  ): Promise<ActivityRecord[]> {
    const result = await this.pool.query<ActivityRecord>(
      `
        SELECT id,
               workspace_id,
               user_id,
               entity_type,
               entity_id,
               action,
               metadata,
               created_at
        FROM activities
        WHERE workspace_id = $1
          AND (
            user_id = $2
            OR user_id IS NULL
          )
        ORDER BY created_at DESC
        LIMIT $3
      `,
      [workspaceId, userId, limit],
    );

    return result.rows;
  }
}
