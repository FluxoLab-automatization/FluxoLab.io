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
exports.WorkflowWebhookService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../shared/database/database.service");
let WorkflowWebhookService = class WorkflowWebhookService {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    async registerWebhook(params) {
        const result = await this.pool.query(`
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
      `, [
            params.workspaceId,
            params.workflowId,
            params.token,
            params.path,
            params.method ?? 'POST',
            params.respondMode ?? 'via_node',
            params.description ?? null,
            params.createdBy ?? null,
        ]);
        return this.mapRegistration(result.rows[0]);
    }
    async getRegistrationByToken(token) {
        const result = await this.pool.query(`
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
      `, [token]);
        const row = result.rows[0];
        if (!row) {
            throw new common_1.NotFoundException({
                status: 'error',
                message: 'Webhook token not found or disabled',
            });
        }
        return this.mapRegistration(row);
    }
    async recordEvent(params) {
        const result = await this.pool.query(`
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
      `, [
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
        ]);
        return result.rows[0].id;
    }
    async updateEventStatus(eventId, status) {
        await this.pool.query(`
        UPDATE webhook_events
           SET status = $2,
               processed_at = CASE
                 WHEN $2 = 'processed' THEN NOW()
                 ELSE processed_at
               END
         WHERE id = $1
      `, [eventId, status]);
    }
    async getEvent(eventId) {
        const result = await this.pool.query(`
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
      `, [eventId]);
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
    mapRegistration(row) {
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
};
exports.WorkflowWebhookService = WorkflowWebhookService;
exports.WorkflowWebhookService = WorkflowWebhookService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], WorkflowWebhookService);
//# sourceMappingURL=workflow-webhook.service.js.map