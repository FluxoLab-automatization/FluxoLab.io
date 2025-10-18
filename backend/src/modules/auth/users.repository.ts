import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';

export interface UserRecord {
  id: string;
  email: string;
  display_name: string;
  avatar_color: string | null;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  async findByEmail(
    email: string,
  ): Promise<(UserRecord & { default_workspace_id: string | null }) | null> {
    const result = await this.pool.query<UserRecord & { default_workspace_id: string | null }>(
      `
        SELECT
          u.id,
          u.email,
          u.display_name,
          u.avatar_color,
          u.password_hash,
          u.created_at,
          u.updated_at,
          u.last_login_at,
          COALESCE(
            u.default_workspace_id,
            (
              SELECT wm.workspace_id
              FROM workspace_members wm
              WHERE wm.user_id = u.id
                AND wm.status = 'active'
              ORDER BY wm.created_at ASC
              LIMIT 1
            ),
            (
              SELECT w.id
              FROM workspaces w
              WHERE w.owner_id = u.id
              ORDER BY w.created_at ASC
              LIMIT 1
            )
          ) AS default_workspace_id
        FROM users u
        WHERE u.email = $1
        LIMIT 1
      `,
      [email.toLowerCase()],
    );

    return result.rows[0] ?? null;
  }

  async findById(id: string): Promise<UserRecord & { default_workspace_id: string | null } | null> {
    const result = await this.pool.query<UserRecord & { default_workspace_id: string | null }>(
      `
        WITH candidate AS (
          SELECT
            wm.workspace_id,
            ROW_NUMBER() OVER (ORDER BY wm.created_at ASC) AS rank
          FROM workspace_members wm
          WHERE wm.user_id = $1
            AND wm.status = 'active'
          UNION ALL
          SELECT
            w.id AS workspace_id,
            999 AS rank
          FROM workspaces w
          WHERE w.owner_id = $1
        ),
        default_ws AS (
          SELECT workspace_id
          FROM candidate
          ORDER BY rank ASC
          LIMIT 1
        )
        SELECT
          u.id,
          u.email,
          u.display_name,
          u.avatar_color,
          u.password_hash,
          u.created_at,
          u.updated_at,
          u.last_login_at,
          COALESCE(
            u.default_workspace_id,
            (
              SELECT wm.workspace_id
              FROM workspace_members wm
              WHERE wm.user_id = u.id
                AND wm.status = 'active'
              ORDER BY wm.created_at ASC
              LIMIT 1
            ),
            (
              SELECT w.id
              FROM workspaces w
              WHERE w.owner_id = u.id
              ORDER BY w.created_at ASC
              LIMIT 1
            )
          ) AS default_workspace_id
        FROM users u
        WHERE u.id = $1
        LIMIT 1
      `,
      [id],
    );

    return result.rows[0] ?? null;
  }

  async createUser({
    email,
    passwordHash,
    displayName,
    avatarColor,
  }: {
    email: string;
    passwordHash: string;
    displayName: string;
    avatarColor: string | null;
  }): Promise<UserRecord> {
    const result = await this.pool.query<UserRecord>(
      `
        INSERT INTO users (email, password_hash, display_name, avatar_color)
        VALUES ($1, $2, $3, $4)
        RETURNING id,
                  email,
                  password_hash,
                  display_name,
                  avatar_color,
                  created_at,
                  updated_at,
                  last_login_at
      `,
      [email.toLowerCase(), passwordHash, displayName, avatarColor],
    );

    return result.rows[0];
  }

  async touchLastLogin(id: string): Promise<void> {
    await this.pool.query(
      `
        UPDATE users
        SET last_login_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
      `,
      [id],
    );
  }

  async setDefaultWorkspace(userId: string, workspaceId: string): Promise<void> {
    await this.pool.query(
      `
        UPDATE users
           SET default_workspace_id = $2,
               updated_at = NOW()
         WHERE id = $1
      `,
      [userId, workspaceId],
    );
  }
}
