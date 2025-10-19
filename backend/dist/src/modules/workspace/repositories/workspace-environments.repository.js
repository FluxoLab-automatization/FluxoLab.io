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
exports.WorkspaceEnvironmentsRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../shared/database/database.service");
let WorkspaceEnvironmentsRepository = class WorkspaceEnvironmentsRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    async ensureDefaultEnvironments(workspaceId) {
        await this.pool.query(`
        INSERT INTO workspace_environments (
          workspace_id,
          name,
          slug,
          environment_type,
          region,
          status,
          metadata
        )
        VALUES
          ($1, 'Sandbox', 'sandbox', 'sandbox', 'sa-east-1', 'ready', jsonb_build_object('seed', 'default')),
          ($1, 'Staging', 'staging', 'staging', 'us-east-1', 'pending', jsonb_build_object('seed', 'default')),
          ($1, 'Producao', 'producao', 'production', 'sa-east-1', 'locked', jsonb_build_object('seed', 'default'))
        ON CONFLICT (workspace_id, slug) DO NOTHING
      `, [workspaceId]);
    }
    async listByWorkspace(workspaceId) {
        const result = await this.pool.query(`
        SELECT id,
               workspace_id,
               name,
               slug,
               environment_type,
               region,
               status,
               metadata,
               last_synced_at,
               created_at,
               updated_at
          FROM workspace_environments
         WHERE workspace_id = $1
         ORDER BY created_at ASC
      `, [workspaceId]);
        return result.rows;
    }
    async updateStatus(params) {
        const result = await this.pool.query(`
        UPDATE workspace_environments
           SET status = $3,
               updated_at = NOW()
         WHERE workspace_id = $1
           AND id = $2
        RETURNING id,
                  workspace_id,
                  name,
                  slug,
                  environment_type,
                  region,
                  status,
                  metadata,
                  last_synced_at,
                  created_at,
                  updated_at
      `, [params.workspaceId, params.environmentId, params.status]);
        return result.rows[0] ?? null;
    }
};
exports.WorkspaceEnvironmentsRepository = WorkspaceEnvironmentsRepository;
exports.WorkspaceEnvironmentsRepository = WorkspaceEnvironmentsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], WorkspaceEnvironmentsRepository);
//# sourceMappingURL=workspace-environments.repository.js.map