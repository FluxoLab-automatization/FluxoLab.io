import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';

export interface WebhookRegistration {
  id: string;
  workspaceId: string;
  workflowId: string;
  token: string;
  path: string;
  method: 'GET' | 'POST';
  respondMode: 'immediate' | 'on_last_node' | 'via_node';
  description: string | null;
  enabled: boolean;
  createdAt: Date;
}

interface WebhookRegistrationRow {
  id: string;
  workspace_id: string;
  workflow_id: string;
  token: string;
  path: string;
  method: 'GET' | 'POST';
  respond_mode: 'immediate' | 'on_last_node' | 'via_node';
  description: string | null;
  enabled: boolean;
  created_at: Date;
}

export interface WebhookEventRecord {
  id: string;
  workspaceId: string;
  webhookId: string;
  correlationId: string;
  headers: Record<string, unknown>;
  query: Record<string, unknown>;
  body: unknown;
}

@Injectable()
export class WorkflowWebhookService {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  async registerWebhook(params: {
    workspaceId: string;
    workflowId: string;
    token: string;
    path: string;
    method?: 'GET' | 'POST';
    respondMode?: 'immediate' | 'on_last_node' | 'via_node';
    createdBy?: string | null;
    description?: string | null;
  }): Promise<WebhookRegistration> {
    const result = await this.pool.query<WebhookRegistrationRow>(
      `
        INSERT INTO webhook_registrations (
          workspace_id,
          workflow_id,
          token,
          path,
          method,
          respond_mode,
          description,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id,
                  workspace_id,
                  workflow_id,
                  token,
                  path,
                  method,
                  respond_mode,
                  description,
                  enabled,
                  created_at
      `,
      [
        params.workspaceId,
        params.workflowId,
        params.token,
        params.path,
        params.method ?? 'POST',
        params.respondMode ?? 'via_node',
        params.description ?? null,
        params.createdBy ?? null,
      ],
    );

    return this.mapRegistration(result.rows[0]);
  }

  async getRegistrationByToken(token: string): Promise<WebhookRegistration> {
    const result = await this.pool.query<WebhookRegistrationRow>(
      `
        SELECT id,
               workspace_id,
               workflow_id,
               token,
               path,
               method,
               respond_mode,
               description,
               enabled,
               created_at
          FROM webhook_registrations
         WHERE token = $1
           AND enabled = TRUE
         LIMIT 1
      `,
      [token],
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException({
        status: 'error',
        message: 'Webhook token not found or disabled',
      });
    }

    return this.mapRegistration(row);
  }

  async recordEvent(params: {
    workspaceId: string;
    webhookId: string;
    correlationId: string;
    method: string;
    headers: Record<string, unknown>;
    query: Record<string, unknown>;
    body: unknown;
    rawBody?: Buffer | null;
    signature?: string | null;
    idempotencyKey?: string | null;
    status?: 'received' | 'enqueued' | 'processed' | 'failed';
  }): Promise<string> {
    const result = await this.pool.query<{ id: string }>(
      `
        INSERT INTO webhook_events (
          workspace_id,
          webhook_id,
          correlation_id,
          http_method,
          headers,
          query_params,
          body_json,
          raw_body,
          signature,
          idempotency_key,
          status
        )
        VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8, $9, $10, $11)
        RETURNING id
      `,
      [
        params.workspaceId,
        params.webhookId,
        params.correlationId,
        params.method,
        JSON.stringify(params.headers ?? {}),
        JSON.stringify(params.query ?? {}),
        params.body ? JSON.stringify(params.body) : null,
        params.rawBody ?? null,
        params.signature ?? null,
        params.idempotencyKey ?? null,
        params.status ?? 'received',
      ],
    );

    return result.rows[0].id;
  }

  async updateEventStatus(eventId: string, status: 'enqueued' | 'processed' | 'failed'): Promise<void> {
    await this.pool.query(
      `
        UPDATE webhook_events
           SET status = $2,
               processed_at = CASE
                 WHEN $2 = 'processed' THEN NOW()
                 ELSE processed_at
               END
         WHERE id = $1
      `,
      [eventId, status],
    );
  }

  async getEvent(eventId: string): Promise<WebhookEventRecord | null> {
    const result = await this.pool.query<{
      id: string;
      workspace_id: string;
      webhook_id: string;
      correlation_id: string;
      headers: Record<string, unknown>;
      query_params: Record<string, unknown>;
      body_json: unknown;
    }>(
      `
        SELECT id,
               workspace_id,
               webhook_id,
               correlation_id,
               headers,
               query_params,
               body_json
          FROM webhook_events
         WHERE id = $1
         LIMIT 1
      `,
      [eventId],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      workspaceId: row.workspace_id,
      webhookId: row.webhook_id,
      correlationId: row.correlation_id,
      headers: row.headers ?? {},
      query: row.query_params ?? {},
      body: row.body_json ?? {},
    };
  }

  private mapRegistration(row: WebhookRegistrationRow): WebhookRegistration {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      workflowId: row.workflow_id,
      token: row.token,
      path: row.path,
      method: row.method,
      respondMode: row.respond_mode,
      description: row.description,
      enabled: row.enabled,
      createdAt: row.created_at,
    };
  }
}
