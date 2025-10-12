import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';

export interface ActivityRecord {
  id: string;
  user_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  payload: Record<string, unknown> | null;
  created_at: Date;
}

@Injectable()
export class ActivitiesRepository {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  async listRecentByUser(
    userId: string,
    limit: number,
  ): Promise<ActivityRecord[]> {
    const result = await this.pool.query<ActivityRecord>(
      `
        SELECT id,
               user_id,
               entity_type,
               entity_id,
               action,
               payload,
               created_at
        FROM activities
        WHERE user_id = $1
           OR (user_id IS NULL AND entity_type = 'system')
        ORDER BY created_at DESC
        LIMIT $2
      `,
      [userId, limit],
    );

    return result.rows;
  }
}
