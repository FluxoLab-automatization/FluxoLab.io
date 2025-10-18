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
exports.WorkflowsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../shared/database/database.service");
let WorkflowsService = class WorkflowsService {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    async createWorkflow(params) {
        const result = await this.pool.query(`
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
      `, [
            params.workspaceId,
            params.name,
            params.tags ?? [],
            params.createdBy ?? null,
        ]);
        const row = result.rows[0];
        return this.mapWorkflow(row);
    }
    async createVersion(params) {
        const nextVersion = await this.getNextVersion(params.workflowId);
        const result = await this.pool.query(`
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
      `, [
            params.workflowId,
            nextVersion,
            JSON.stringify(params.definition),
            params.checksum,
            params.createdBy ?? null,
        ]);
        return this.mapVersion(result.rows[0]);
    }
    async activateVersion(workspaceId, workflowId, versionId) {
        await this.pool.query(`
        UPDATE workflows
           SET active_version_id = $3,
               status = 'active',
               updated_at = NOW()
         WHERE id = $1
           AND workspace_id = $2
      `, [workflowId, workspaceId, versionId]);
    }
    async getWorkflow(workspaceId, workflowId) {
        const result = await this.pool.query(`
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
      `, [workflowId, workspaceId]);
        const row = result.rows[0];
        if (!row) {
            throw new common_1.NotFoundException({
                status: 'error',
                message: 'Workflow not found',
            });
        }
        return this.mapWorkflow(row);
    }
    async getActiveVersion(workspaceId, workflowId) {
        const result = await this.pool.query(`
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
      `, [workflowId, workspaceId]);
        const row = result.rows[0];
        if (!row) {
            throw new common_1.NotFoundException({
                status: 'error',
                message: 'Active workflow version not found',
            });
        }
        return this.mapVersion(row);
    }
    async getNextVersion(workflowId) {
        const result = await this.pool.query(`
        SELECT MAX(version)::int AS max
          FROM workflow_versions
         WHERE workflow_id = $1
      `, [workflowId]);
        const current = result.rows[0]?.max ?? 0;
        return current + 1;
    }
    mapWorkflow(row) {
        return {
            id: row.id,
            workspaceId: row.workspace_id,
            name: row.name,
            status: row.status,
            activeVersionId: row.active_version_id,
            tags: row.tags ?? [],
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
    mapVersion(row) {
        return {
            id: row.id,
            workflowId: row.workflow_id,
            version: row.version,
            definition: row.definition,
            checksum: row.checksum,
            createdAt: row.created_at,
        };
    }
};
exports.WorkflowsService = WorkflowsService;
exports.WorkflowsService = WorkflowsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], WorkflowsService);
//# sourceMappingURL=workflows.service.js.map