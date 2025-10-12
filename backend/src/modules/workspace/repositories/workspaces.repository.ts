import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';

interface WorkspaceRow {
  id: string;
  owner_id: string | null;
  plan_id: string | null;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'archived';
  timezone: string;
  region: string | null;
  settings: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

export interface WorkspaceEntity {
  id: string;
  ownerId: string | null;
  planId: string | null;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'archived';
  timezone: string;
  region: string | null;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class WorkspacesRepository {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  private normalize(row: WorkspaceRow): WorkspaceEntity {
    return {
      id: row.id,
      ownerId: row.owner_id,
      planId: row.plan_id,
      name: row.name,
      slug: row.slug,
      status: row.status,
      timezone: row.timezone,
      region: row.region,
      settings: row.settings ?? {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private slugify(input: string): string {
    const base = input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');

    return base.length > 0 ? base : 'workspace';
  }

  private async slugExists(slug: string): Promise<boolean> {
    const result = await this.pool.query<{ exists: boolean }>(
      `
        SELECT EXISTS(
          SELECT 1
            FROM workspaces
           WHERE slug = $1
        ) AS exists
      `,
      [slug],
    );

    return Boolean(result.rows[0]?.exists);
  }

  async generateUniqueSlug(name: string): Promise<string> {
    const base = this.slugify(name);
    let slug = base;
    let counter = 2;

    while (await this.slugExists(slug)) {
      slug = `${base}-${counter}`;
      counter += 1;
      if (counter > 99) {
        slug = `${base}-${Date.now()}`;
        break;
      }
    }

    return slug;
  }

  async createWorkspace(params: {
    ownerId: string | null;
    planId: string | null;
    name: string;
    slug: string;
    timezone?: string;
    region?: string | null;
    settings?: Record<string, unknown>;
  }): Promise<WorkspaceEntity> {
    const result = await this.pool.query<WorkspaceRow>(
      `
        INSERT INTO workspaces (
          owner_id,
          plan_id,
          name,
          slug,
          timezone,
          region,
          settings
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
        RETURNING id,
                  owner_id,
                  plan_id,
                  name,
                  slug,
                  status,
                  timezone,
                  region,
                  settings,
                  created_at,
                  updated_at
      `,
      [
        params.ownerId,
        params.planId,
        params.name,
        params.slug,
        params.timezone ?? 'America/Sao_Paulo',
        params.region ?? null,
        JSON.stringify(params.settings ?? {}),
      ],
    );

    return this.normalize(result.rows[0]);
  }

  async findById(id: string): Promise<WorkspaceEntity | null> {
    const result = await this.pool.query<WorkspaceRow>(
      `
        SELECT id,
               owner_id,
               plan_id,
               name,
               slug,
               status,
               timezone,
               region,
               settings,
               created_at,
               updated_at
          FROM workspaces
         WHERE id = $1
         LIMIT 1
      `,
      [id],
    );

    const row = result.rows[0];
    return row ? this.normalize(row) : null;
  }

  async findBySlug(slug: string): Promise<WorkspaceEntity | null> {
    const result = await this.pool.query<WorkspaceRow>(
      `
        SELECT id,
               owner_id,
               plan_id,
               name,
               slug,
               status,
               timezone,
               region,
               settings,
               created_at,
               updated_at
          FROM workspaces
         WHERE slug = $1
         LIMIT 1
      `,
      [slug],
    );

    const row = result.rows[0];
    return row ? this.normalize(row) : null;
  }

  async updatePlan(workspaceId: string, planId: string): Promise<void> {
    await this.pool.query(
      `
        UPDATE workspaces
           SET plan_id = $2,
               updated_at = NOW()
         WHERE id = $1
      `,
      [workspaceId, planId],
    );
  }

  async findDefaultForUser(userId: string): Promise<WorkspaceEntity | null> {
    const result = await this.pool.query<WorkspaceRow>(
      `
        WITH candidate AS (
          SELECT w.*,
                 ROW_NUMBER() OVER (ORDER BY w.created_at ASC) AS owner_rank
            FROM workspaces w
           WHERE w.owner_id = $1
          UNION ALL
          SELECT w.*,
                 ROW_NUMBER() OVER (ORDER BY wm.created_at ASC) + 1000 AS member_rank
            FROM workspaces w
            JOIN workspace_members wm
              ON wm.workspace_id = w.id
           WHERE wm.user_id = $1
             AND wm.status = 'active'
        )
        SELECT *
          FROM candidate
         ORDER BY owner_rank
         LIMIT 1
      `,
      [userId],
    );

    const row = result.rows[0];
    return row ? this.normalize(row) : null;
  }
}
