import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';

export interface ProfileRecord {
  id: string;
  code: string;
  name: string;
  description: string | null;
  scope: 'workspace' | 'global';
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class ProfilesRepository {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  async findByCode(code: string): Promise<ProfileRecord | null> {
    const result = await this.pool.query<ProfileRecord>(
      `
        SELECT id,
               code,
               name,
               description,
               scope,
               created_at,
               updated_at
          FROM profiles
         WHERE code = $1
         LIMIT 1
      `,
      [code],
    );

    return result.rows[0] ?? null;
  }

  async getRequiredProfileId(code: string): Promise<string> {
    const profile = await this.findByCode(code);
    if (!profile) {
      throw new NotFoundException(`Perfil ${code} nao encontrado`);
    }

    return profile.id;
  }

  async assignGlobalProfile(params: {
    userId: string;
    profileCode: string;
    assignedBy?: string | null;
  }): Promise<void> {
    const profileId = await this.getRequiredProfileId(params.profileCode);

    await this.pool.query(
      `
        INSERT INTO user_profiles (user_id, profile_id, scope, assigned_by)
        VALUES ($1, $2, 'global', $3)
        ON CONFLICT (user_id, profile_id, scope) DO UPDATE
           SET assigned_by = EXCLUDED.assigned_by,
               assigned_at = NOW()
      `,
      [params.userId, profileId, params.assignedBy ?? null],
    );
  }

  async listWorkspaceProfiles(): Promise<ProfileRecord[]> {
    const result = await this.pool.query<ProfileRecord>(
      `
        SELECT id,
               code,
               name,
               description,
               scope,
               created_at,
               updated_at
          FROM profiles
         WHERE scope = 'workspace'
         ORDER BY name ASC
      `,
    );

    return result.rows;
  }
}
