import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';

export interface ConversationRecord {
  id: string;
  owner_id: string;
  title: string;
  status: string;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class ConversationsRepository {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  async listRecentByOwner(
    ownerId: string,
    limit: number,
  ): Promise<ConversationRecord[]> {
    const result = await this.pool.query<ConversationRecord>(
      `
        SELECT id,
               owner_id,
               title,
               status,
               metadata,
               created_at,
               updated_at
        FROM conversations
        WHERE owner_id = $1
        ORDER BY updated_at DESC
        LIMIT $2
      `,
      [ownerId, limit],
    );

    return result.rows;
  }

  async countByOwner(ownerId: string): Promise<number> {
    const result = await this.pool.query<{ total: number }>(
      `
        SELECT COUNT(*)::int AS total
        FROM conversations
        WHERE owner_id = $1
      `,
      [ownerId],
    );

    return result.rows[0]?.total ?? 0;
  }
}
