"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../shared/database/database.service");
const crypto_1 = require("crypto");
let WebhooksService = class WebhooksService {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    async createWebhook(workspaceId, webhookData) {
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
    async listWebhooks(workspaceId, options) {
        const countResult = await this.pool.query(`
      SELECT COUNT(*) as total
      FROM webhooks
      WHERE workspace_id = $1 AND deleted_at IS NULL
    `, [workspaceId]);
        const total = parseInt(countResult.rows[0].total);
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
    async getWebhook(workspaceId, webhookId) {
        const result = await this.pool.query(`
      SELECT 
        id, workspace_id, name, path, method, authentication,
        respond_mode, workflow_id, is_active, token, created_at, updated_at
      FROM webhooks
      WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL
    `, [webhookId, workspaceId]);
        const row = result.rows[0];
        if (!row) {
            throw new common_1.NotFoundException('Webhook not found');
        }
        return this.mapWebhook(row);
    }
    async updateWebhook(workspaceId, webhookId, updates) {
        const setClauses = [];
        const values = [webhookId, workspaceId];
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
            throw new common_1.NotFoundException('Webhook not found');
        }
        return this.mapWebhook(row);
    }
    async deleteWebhook(workspaceId, webhookId) {
        const result = await this.pool.query(`
      UPDATE webhooks
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL
    `, [webhookId, workspaceId]);
        if (result.rowCount === 0) {
            throw new common_1.NotFoundException('Webhook not found');
        }
    }
    async testWebhook(workspaceId, webhookId, testData) {
        const webhook = await this.getWebhook(workspaceId, webhookId);
        const startTime = Date.now();
        try {
            const response = {
                status: 'success',
                message: 'Webhook test executed successfully',
                data: testData,
                timestamp: new Date().toISOString(),
            };
            const executionTime = Date.now() - startTime;
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
        }
        catch (error) {
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
    async executeWebhook(token, requestData) {
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
                executionId: webhook.id,
            };
        }
        catch (error) {
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
    async getWebhookLogs(workspaceId, webhookId, options) {
        await this.getWebhook(workspaceId, webhookId);
        const countResult = await this.pool.query(`
      SELECT COUNT(*) as total
      FROM webhook_logs
      WHERE webhook_id = $1
    `, [webhookId]);
        const total = parseInt(countResult.rows[0].total);
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
    async logWebhookExecution(webhookId, logData) {
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
    generateWebhookToken() {
        return (0, crypto_1.randomBytes)(32).toString('hex');
    }
    mapWebhook(row) {
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
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map