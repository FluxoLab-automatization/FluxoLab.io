import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';

interface ExecutionRow {
  id: string;
  workspace_id: string;
  workflow_id: string;
  workflow_version_id: string;
  status: string;
  started_at: Date | null;
  finished_at: Date | null;
  created_at: Date;
}

export interface CreateExecutionParams {
  workspaceId: string;
  workflowId: string;
  workflowVersionId: string;
  triggerEventId?: string | null;
  correlationId?: string | null;
}

export interface ExecutionWithDetails {
  id: string;
  workspaceId: string;
  workflowId: string;
  workflowVersionId: string;
  triggerEventId: string | null;
  correlationId: string | null;
  status: string;
}

export interface AppendStepParams {
  executionId: string;
  nodeId: string;
  nodeName: string;
  status: 'running' | 'succeeded' | 'failed' | 'skipped';
  attempt: number;
  inputItems?: unknown;
  outputItems?: unknown;
  logs?: unknown;
  error?: unknown;
}

@Injectable()
export class WorkflowExecutionsService {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  async createExecution(params: CreateExecutionParams): Promise<ExecutionRow> {
    const result = await this.pool.query<ExecutionRow>(
      `
        INSERT INTO executions (
          workspace_id,
          workflow_id,
          workflow_version_id,
          trigger_event_id,
          correlation_id,
          status
        )
        VALUES ($1, $2, $3, $4, $5, 'queued')
        RETURNING id,
                  workspace_id,
                  workflow_id,
                  workflow_version_id,
                  status,
                  started_at,
                  finished_at,
                  created_at
      `,
      [
        params.workspaceId,
        params.workflowId,
        params.workflowVersionId,
        params.triggerEventId ?? null,
        params.correlationId ?? null,
      ],
    );

    return result.rows[0];
  }

  async markRunning(executionId: string): Promise<void> {
    await this.pool.query(
      `
        UPDATE executions
           SET status = 'running',
               started_at = COALESCE(started_at, NOW())
         WHERE id = $1
      `,
      [executionId],
    );
  }

  async markFinished(executionId: string, status: 'succeeded' | 'failed' | 'canceled', error?: unknown): Promise<void> {
    await this.pool.query(
      `
        UPDATE executions
           SET status = $2,
               finished_at = NOW(),
               error = $3::jsonb
         WHERE id = $1
      `,
      [executionId, status, error ? JSON.stringify(error) : null],
    );
  }

  async appendStep(params: AppendStepParams): Promise<void> {
    await this.pool.query(
      `
        INSERT INTO execution_steps (
          execution_id,
          node_id,
          node_name,
          status,
          attempt,
          started_at,
          finished_at,
          input_items,
          output_items,
          logs,
          error
        )
        VALUES (
          $1,
          $2,
          $3,
          $4::step_status,
          $5,
          CASE WHEN $4::text = 'running' THEN NOW() ELSE NULL END,
          CASE WHEN $4::text IN ('succeeded', 'failed', 'skipped') THEN NOW() ELSE NULL END,
          $6::jsonb,
          $7::jsonb,
          $8::jsonb,
          $9::jsonb
        )
      `,
      [
        params.executionId,
        params.nodeId,
        params.nodeName,
        params.status,
        params.attempt,
        params.inputItems ? JSON.stringify(params.inputItems) : null,
        params.outputItems ? JSON.stringify(params.outputItems) : null,
        params.logs ? JSON.stringify(params.logs) : null,
        params.error ? JSON.stringify(params.error) : null,
      ],
    );
  }

  async listExecutions(
    workspaceId: string,
    workflowId: string,
    options: { limit: number; offset: number },
  ): Promise<ExecutionWithDetails[]> {
    const result = await this.pool.query<ExecutionRow & { trigger_event_id: string | null; correlation_id: string | null }>(
      `
        SELECT id,
               workspace_id,
               workflow_id,
               workflow_version_id,
               trigger_event_id,
               correlation_id,
               status,
               started_at,
               finished_at,
               created_at
          FROM executions
         WHERE workspace_id = $1
           AND workflow_id = $2
         ORDER BY created_at DESC
         LIMIT $3 OFFSET $4
      `,
      [workspaceId, workflowId, options.limit, options.offset],
    );

    return result.rows.map((row) => ({
      id: row.id,
      workspaceId: row.workspace_id,
      workflowId: row.workflow_id,
      workflowVersionId: row.workflow_version_id,
      triggerEventId: (row as any).trigger_event_id ?? null,
      correlationId: (row as any).correlation_id ?? null,
      status: row.status,
    }));
  }

  async getExecution(executionId: string): Promise<ExecutionWithDetails | null> {
    const result = await this.pool.query<ExecutionRow & { trigger_event_id: string | null; correlation_id: string | null }>(
      `
        SELECT id,
               workspace_id,
               workflow_id,
               workflow_version_id,
               trigger_event_id,
               correlation_id,
               status
          FROM executions
         WHERE id = $1
         LIMIT 1
      `,
      [executionId],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      workspaceId: row.workspace_id,
      workflowId: row.workflow_id,
      workflowVersionId: row.workflow_version_id,
      triggerEventId: (row as any).trigger_event_id ?? null,
      correlationId: (row as any).correlation_id ?? null,
      status: row.status,
    };
  }
}
