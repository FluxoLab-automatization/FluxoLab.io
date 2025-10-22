import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';
import {
  WorkflowDefinition,
  WorkflowNodeDefinition,
  WorkflowConnectionDefinition,
} from './engine/types';

interface WorkflowRow {
  id: string;
  workspace_id: string;
  name: string;
  status: string;
  active_version_id: string | null;
  tags: string[] | null;
  created_at: Date;
  updated_at: Date;
}

interface WorkflowVersionRow {
  id: string;
  workflow_id: string;
  version: number;
  definition: WorkflowDefinition;
  checksum: string;
  created_at: Date;
}

export interface WorkflowEntity {
  id: string;
  workspaceId: string;
  name: string;
  status: 'draft' | 'active' | 'archived';
  activeVersionId: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowVersionEntity {
  id: string;
  workflowId: string;
  version: number;
  definition: WorkflowDefinition;
  checksum: string;
  createdAt: Date;
}

@Injectable()
export class WorkflowsService {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  async createWorkflow(params: {
    workspaceId: string;
    name: string;
    createdBy?: string | null;
    tags?: string[];
  }): Promise<WorkflowEntity> {
    const result = await this.pool.query<WorkflowRow>(
      `
        INSERT INTO workflows (
          workspace_id,
          name,
          status,
          tags,
          created_by,
          updated_by
        )
        VALUES ($1, $2, 'draft', $3, $4, $4)
        RETURNING id,
                  workspace_id,
                  name,
                  status,
                  active_version_id,
                  tags,
                  created_at,
                  updated_at
      `,
      [
        params.workspaceId,
        params.name,
        params.tags ?? [],
        params.createdBy ?? null,
      ],
    );

    const row = result.rows[0];
    return this.mapWorkflow(row);
  }

  async createVersion(params: {
    workflowId: string;
    definition: WorkflowDefinition;
    checksum: string;
    createdBy?: string | null;
  }): Promise<WorkflowVersionEntity> {
    const nextVersion = await this.getNextVersion(params.workflowId);
    const result = await this.pool.query<WorkflowVersionRow>(
      `
        INSERT INTO workflow_versions (
          workflow_id,
          version,
          definition,
          checksum,
          created_by
        )
        VALUES ($1, $2, $3::jsonb, $4, $5)
        RETURNING id,
                  workflow_id,
                  version,
                  definition,
                  checksum,
                  created_at
      `,
      [
        params.workflowId,
        nextVersion,
        JSON.stringify(params.definition),
        params.checksum,
        params.createdBy ?? null,
      ],
    );

    return this.mapVersion(result.rows[0]);
  }

  async activateVersion(workspaceId: string, workflowId: string, versionId: string): Promise<void> {
    await this.pool.query(
      `
        UPDATE workflows
           SET active_version_id = $3,
               status = 'active',
               updated_at = NOW()
         WHERE id = $1
           AND workspace_id = $2
      `,
      [workflowId, workspaceId, versionId],
    );
  }

  async getWorkflow(workspaceId: string, workflowId: string): Promise<WorkflowEntity> {
    const result = await this.pool.query<WorkflowRow>(
      `
        SELECT id,
               workspace_id,
               name,
               status,
               active_version_id,
               tags,
               created_at,
               updated_at
          FROM workflows
         WHERE id = $1
           AND workspace_id = $2
           AND deleted_at IS NULL
         LIMIT 1
      `,
      [workflowId, workspaceId],
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException({
        status: 'error',
        message: 'Workflow not found',
      });
    }

    return this.mapWorkflow(row);
  }

  async getActiveVersion(workspaceId: string, workflowId: string): Promise<WorkflowVersionEntity> {
    const result = await this.pool.query<WorkflowVersionRow>(
      `
        SELECT v.id,
               v.workflow_id,
               v.version,
               v.definition,
               v.checksum,
               v.created_at
          FROM workflows w
          JOIN workflow_versions v
            ON v.id = w.active_version_id
         WHERE w.id = $1
           AND w.workspace_id = $2
         LIMIT 1
      `,
      [workflowId, workspaceId],
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException({
        status: 'error',
        message: 'Active workflow version not found',
      });
    }

    return this.mapVersion(row);
  }

  async getWorkflowPreview(
    workspaceId: string,
    workflowId: string,
  ): Promise<WorkflowDefinition> {
    const version = await this.getActiveVersion(workspaceId, workflowId);
    return version.definition;
  }

  private async getNextVersion(workflowId: string): Promise<number> {
    const result = await this.pool.query<{ max: number | null }>(
      `
        SELECT MAX(version)::int AS max
          FROM workflow_versions
         WHERE workflow_id = $1
      `,
      [workflowId],
    );
    const current = result.rows[0]?.max ?? 0;
    return current + 1;
  }

  private mapWorkflow(row: WorkflowRow): WorkflowEntity {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      name: row.name,
      status: row.status as WorkflowEntity['status'],
      activeVersionId: row.active_version_id,
      tags: row.tags ?? [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async listWorkflows(workspaceId: string, options: { limit: number; offset: number }): Promise<WorkflowEntity[]> {
    const result = await this.pool.query<WorkflowRow>(
      `
        SELECT id,
               workspace_id,
               name,
               status,
               active_version_id,
               tags,
               created_at,
               updated_at
          FROM workflows
         WHERE workspace_id = $1
           AND deleted_at IS NULL
         ORDER BY updated_at DESC
         LIMIT $2 OFFSET $3
      `,
      [workspaceId, options.limit, options.offset],
    );

    return result.rows.map((row) => this.mapWorkflow(row));
  }

  async updateWorkflow(
    workspaceId: string,
    workflowId: string,
    updates: { name?: string; tags?: string[] },
  ): Promise<WorkflowEntity> {
    const setClauses: string[] = [];
    const values: unknown[] = [workflowId, workspaceId];
    let paramIndex = 3;

    if (updates.name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }

    if (updates.tags !== undefined) {
      setClauses.push(`tags = $${paramIndex++}`);
      values.push(updates.tags);
    }

    if (setClauses.length === 0) {
      return this.getWorkflow(workspaceId, workflowId);
    }

    setClauses.push(`updated_at = NOW()`);

    const result = await this.pool.query<WorkflowRow>(
      `
        UPDATE workflows
           SET ${setClauses.join(', ')}
         WHERE id = $1
           AND workspace_id = $2
           AND deleted_at IS NULL
         RETURNING id,
                   workspace_id,
                   name,
                   status,
                   active_version_id,
                   tags,
                   created_at,
                   updated_at
      `,
      values,
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException({
        status: 'error',
        message: 'Workflow not found',
      });
    }

    return this.mapWorkflow(row);
  }

  async deleteWorkflow(workspaceId: string, workflowId: string): Promise<void> {
    const result = await this.pool.query(
      `
        UPDATE workflows
           SET deleted_at = NOW(),
               updated_at = NOW()
         WHERE id = $1
           AND workspace_id = $2
           AND deleted_at IS NULL
      `,
      [workflowId, workspaceId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException({
        status: 'error',
        message: 'Workflow not found',
      });
    }
  }

  private mapVersion(row: WorkflowVersionRow): WorkflowVersionEntity {
    return {
      id: row.id,
      workflowId: row.workflow_id,
      version: row.version,
      definition: {
        nodes: (row.definition?.nodes ?? []) as WorkflowNodeDefinition[],
        connections: (row.definition?.connections ?? []) as WorkflowConnectionDefinition[],
      },
      checksum: row.checksum,
      createdAt: row.created_at,
    };
  }
}
