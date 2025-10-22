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
exports.WorkflowExecutionsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../shared/database/database.service");
let WorkflowExecutionsService = class WorkflowExecutionsService {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    async createExecution(params) {
        const result = await this.pool.query(`
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
      `, [
            params.workspaceId,
            params.workflowId,
            params.workflowVersionId,
            params.triggerEventId ?? null,
            params.correlationId ?? null,
        ]);
        return result.rows[0];
    }
    async markRunning(executionId) {
        await this.pool.query(`
        UPDATE executions
           SET status = 'running',
               started_at = COALESCE(started_at, NOW())
         WHERE id = $1
      `, [executionId]);
    }
    async markFinished(executionId, status, error) {
        await this.pool.query(`
        UPDATE executions
           SET status = $2,
               finished_at = NOW(),
               error = $3::jsonb
         WHERE id = $1
      `, [executionId, status, error ? JSON.stringify(error) : null]);
    }
    async appendStep(params) {
        await this.pool.query(`
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
      `, [
            params.executionId,
            params.nodeId,
            params.nodeName,
            params.status,
            params.attempt,
            params.inputItems ? JSON.stringify(params.inputItems) : null,
            params.outputItems ? JSON.stringify(params.outputItems) : null,
            params.logs ? JSON.stringify(params.logs) : null,
            params.error ? JSON.stringify(params.error) : null,
        ]);
    }
    async listExecutions(workspaceId, workflowId, options) {
        const result = await this.pool.query(`
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
      `, [workspaceId, workflowId, options.limit, options.offset]);
        return result.rows.map((row) => ({
            id: row.id,
            workspaceId: row.workspace_id,
            workflowId: row.workflow_id,
            workflowVersionId: row.workflow_version_id,
            triggerEventId: row.trigger_event_id ?? null,
            correlationId: row.correlation_id ?? null,
            status: row.status,
        }));
    }
    async getExecution(executionId) {
        const result = await this.pool.query(`
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
      `, [executionId]);
        const row = result.rows[0];
        if (!row) {
            return null;
        }
        return {
            id: row.id,
            workspaceId: row.workspace_id,
            workflowId: row.workflow_id,
            workflowVersionId: row.workflow_version_id,
            triggerEventId: row.trigger_event_id ?? null,
            correlationId: row.correlation_id ?? null,
            status: row.status,
        };
    }
};
exports.WorkflowExecutionsService = WorkflowExecutionsService;
exports.WorkflowExecutionsService = WorkflowExecutionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], WorkflowExecutionsService);
//# sourceMappingURL=workflow-executions.service.js.map