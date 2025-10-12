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

  async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await this.pool.query<UserRecord>(
      `
        SELECT id,
               email,
               display_name,
               password_hash,
               avatar_color,
               created_at,
               updated_at,
               last_login_at
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [email.toLowerCase()],
    );

    return result.rows[0] ?? null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const result = await this.pool.query<UserRecord>(
      `
        SELECT id,
               email,
               display_name,
               avatar_color,
               password_hash,
               created_at,
               updated_at,
               last_login_at
        FROM users
        WHERE id = $1
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
}
