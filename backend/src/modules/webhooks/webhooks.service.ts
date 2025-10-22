import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';
import { randomBytes } from 'crypto';

export interface WebhookEntity {
  id: string;
  workspaceId: string;
  name: string;
  path: string;
  method: string;
  authentication: 'none' | 'basic' | 'bearer' | 'api-key';
  respondMode: 'immediately' | 'when_complete' | 'never';
  workflowId: string | null;
  isActive: boolean;
  token: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  payload: any;
  responseStatus: number;
  responseBody: any;
  executionTime: number;
  createdAt: Date;
}

export interface WebhookExecutionResult {
  success: boolean;
  status: number;
  body: any;
  executionId?: string;
  error?: string;
}

@Injectable()
export class WebhooksService {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  async createWebhook(
    workspaceId: string,
    webhookData: {
      name: string;
      path: string;
      method: string;
      authentication: string;
      respondMode: string;
      workflowId?: string;
      createdBy: string;
    },
  ): Promise<WebhookEntity> {
    const token = this.generateWebhookToken();
    
    const result = await this.pool.query(`
      INSERT INTO webhooks (
        workspace_id,
        name,
        path,
        method,
        authentication,
        respond_mode,
        workflow_id,
        is_active,
        token,
        created_by,
        updated_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $9, $9)
      RETURNING 
        id, workspace_id, name, path, method, authentication, 
        respond_mode, workflow_id, is_active, token, created_at, updated_at
    `, [
      workspaceId,
      webhookData.name,
      webhookData.path,
      webhookData.method,
      webhookData.authentication,
      webhookData.respondMode,
      webhookData.workflowId || null,
      token,
      webhookData.createdBy,
    ]);

    return this.mapWebhook(result.rows[0]);
  }

  async listWebhooks(
    workspaceId: string,
    options: { limit: number; offset: number },
  ): Promise<{ webhooks: WebhookEntity[]; total: number }> {
    // Get total count
    const countResult = await this.pool.query(`
      SELECT COUNT(*) as total
      FROM webhooks
      WHERE workspace_id = $1 AND deleted_at IS NULL
    `, [workspaceId]);

    const total = parseInt(countResult.rows[0].total);

    // Get webhooks
    const webhooksResult = await this.pool.query(`
      SELECT 
        id, workspace_id, name, path, method, authentication,
        respond_mode, workflow_id, is_active, token, created_at, updated_at
      FROM webhooks
      WHERE workspace_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [workspaceId, options.limit, options.offset]);

    const webhooks = webhooksResult.rows.map(row => this.mapWebhook(row));

    return { webhooks, total };
  }

  async getWebhook(workspaceId: string, webhookId: string): Promise<WebhookEntity> {
    const result = await this.pool.query(`
      SELECT 
        id, workspace_id, name, path, method, authentication,
        respond_mode, workflow_id, is_active, token, created_at, updated_at
      FROM webhooks
      WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL
    `, [webhookId, workspaceId]);

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Webhook not found');
    }

    return this.mapWebhook(row);
  }

  async updateWebhook(
    workspaceId: string,
    webhookId: string,
    updates: Partial<{
      name: string;
      path: string;
      method: string;
      authentication: string;
      respondMode: string;
      workflowId: string;
      isActive: boolean;
    }>,
  ): Promise<WebhookEntity> {
    const setClauses: string[] = [];
    const values: unknown[] = [webhookId, workspaceId];
    let paramIndex = 3;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        setClauses.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    });

    if (setClauses.length === 0) {
      return this.getWebhook(workspaceId, webhookId);
    }

    setClauses.push('updated_at = NOW()');

    const result = await this.pool.query(`
      UPDATE webhooks
      SET ${setClauses.join(', ')}
      WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL
      RETURNING 
        id, workspace_id, name, path, method, authentication,
        respond_mode, workflow_id, is_active, token, created_at, updated_at
    `, values);

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Webhook not found');
    }

    return this.mapWebhook(row);
  }

  async deleteWebhook(workspaceId: string, webhookId: string): Promise<void> {
    const result = await this.pool.query(`
      UPDATE webhooks
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL
    `, [webhookId, workspaceId]);

    if (result.rowCount === 0) {
      throw new NotFoundException('Webhook not found');
    }
  }

  async testWebhook(
    workspaceId: string,
    webhookId: string,
    testData: any,
  ): Promise<{ success: boolean; response: any; executionTime: number }> {
    const webhook = await this.getWebhook(workspaceId, webhookId);
    
    const startTime = Date.now();
    
    try {
      // Mock webhook execution - in real implementation, this would trigger the workflow
      const response = {
        status: 'success',
        message: 'Webhook test executed successfully',
        data: testData,
        timestamp: new Date().toISOString(),
      };

      const executionTime = Date.now() - startTime;

      // Log the test execution
      await this.logWebhookExecution(webhookId, {
        method: 'POST',
        path: webhook.path,
        headers: {},
        query: {},
        payload: testData,
        responseStatus: 200,
        responseBody: response,
        executionTime,
      });

      return {
        success: true,
        response,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await this.logWebhookExecution(webhookId, {
        method: 'POST',
        path: webhook.path,
        headers: {},
        query: {},
        payload: testData,
        responseStatus: 500,
        responseBody: { error: error instanceof Error ? error.message : 'Unknown error' },
        executionTime,
      });

      return {
        success: false,
        response: { error: error instanceof Error ? error.message : 'Unknown error' },
        executionTime,
      };
    }
  }

  async executeWebhook(
    token: string,
    requestData: {
      payload: any;
      query: any;
      headers: Record<string, string>;
      method: string;
    },
  ): Promise<WebhookExecutionResult> {
    // Find webhook by token
    const result = await this.pool.query(`
      SELECT 
        id, workspace_id, name, path, method, authentication,
        respond_mode, workflow_id, is_active
      FROM webhooks
      WHERE token = $1 AND is_active = true AND deleted_at IS NULL
    `, [token]);

    const webhook = result.rows[0];
    if (!webhook) {
      return {
        success: false,
        status: 404,
        body: { error: 'Webhook not found' },
      };
    }

    const startTime = Date.now();

    try {
      // TODO: In real implementation, trigger the associated workflow
      // For now, just log the execution and return success
      
      const executionTime = Date.now() - startTime;
      
      await this.logWebhookExecution(webhook.id, {
        method: requestData.method,
        path: webhook.path,
        headers: requestData.headers,
        query: requestData.query,
        payload: requestData.payload,
        responseStatus: 200,
        responseBody: { success: true, message: 'Webhook executed successfully' },
        executionTime,
      });

      return {
        success: true,
        status: 200,
        body: { success: true, message: 'Webhook executed successfully' },
        executionId: webhook.id, // Mock execution ID
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await this.logWebhookExecution(webhook.id, {
        method: requestData.method,
        path: webhook.path,
        headers: requestData.headers,
        query: requestData.query,
        payload: requestData.payload,
        responseStatus: 500,
        responseBody: { error: error instanceof Error ? error.message : 'Unknown error' },
        executionTime,
      });

      return {
        success: false,
        status: 500,
        body: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  async getWebhookLogs(
    workspaceId: string,
    webhookId: string,
    options: { limit: number; offset: number },
  ): Promise<{ logs: WebhookLog[]; total: number }> {
    // Verify webhook belongs to workspace
    await this.getWebhook(workspaceId, webhookId);

    // Get total count
    const countResult = await this.pool.query(`
      SELECT COUNT(*) as total
      FROM webhook_logs
      WHERE webhook_id = $1
    `, [webhookId]);

    const total = parseInt(countResult.rows[0].total);

    // Get logs
    const logsResult = await this.pool.query(`
      SELECT 
        id, webhook_id, method, path, headers, query, payload,
        response_status, response_body, execution_time, created_at
      FROM webhook_logs
      WHERE webhook_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [webhookId, options.limit, options.offset]);

    const logs = logsResult.rows.map(row => ({
      id: row.id,
      webhookId: row.webhook_id,
      method: row.method,
      path: row.path,
      headers: row.headers,
      query: row.query,
      payload: row.payload,
      responseStatus: row.response_status,
      responseBody: row.response_body,
      executionTime: row.execution_time,
      createdAt: row.created_at,
    }));

    return { logs, total };
  }

  private async logWebhookExecution(
    webhookId: string,
    logData: {
      method: string;
      path: string;
      headers: Record<string, string>;
      query: Record<string, string>;
      payload: any;
      responseStatus: number;
      responseBody: any;
      executionTime: number;
    },
  ): Promise<void> {
    await this.pool.query(`
      INSERT INTO webhook_logs (
        webhook_id, method, path, headers, query, payload,
        response_status, response_body, execution_time
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      webhookId,
      logData.method,
      logData.path,
      JSON.stringify(logData.headers),
      JSON.stringify(logData.query),
      JSON.stringify(logData.payload),
      logData.responseStatus,
      JSON.stringify(logData.responseBody),
      logData.executionTime,
    ]);
  }

  private generateWebhookToken(): string {
    return randomBytes(32).toString('hex');
  }

  private mapWebhook(row: any): WebhookEntity {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      name: row.name,
      path: row.path,
      method: row.method,
      authentication: row.authentication,
      respondMode: row.respond_mode,
      workflowId: row.workflow_id,
      isActive: row.is_active,
      token: row.token,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}