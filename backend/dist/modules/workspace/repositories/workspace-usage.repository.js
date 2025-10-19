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
exports.WorkspaceUsageRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../shared/database/database.service");
let WorkspaceUsageRepository = class WorkspaceUsageRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    async getLatestSnapshot(workspaceId) {
        const result = await this.pool.query(`
        SELECT id,
               workspace_id,
               period_start::text,
               period_end::text,
               workflows_active,
               users_active,
               webhook_events,
               metadata,
               created_at
          FROM workspace_usage_snapshots
         WHERE workspace_id = $1
         ORDER BY period_end DESC, created_at DESC
         LIMIT 1
      `, [workspaceId]);
        const row = result.rows[0];
        if (!row) {
            return null;
        }
        return {
            workspaceId: row.workspace_id,
            periodStart: row.period_start,
            periodEnd: row.period_end,
            workflowsActive: row.workflows_active,
            usersActive: row.users_active,
            webhookEvents: row.webhook_events,
            collectedAt: row.created_at.toISOString(),
            metadata: row.metadata ?? {},
        };
    }
};
exports.WorkspaceUsageRepository = WorkspaceUsageRepository;
exports.WorkspaceUsageRepository = WorkspaceUsageRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], WorkspaceUsageRepository);
//# sourceMappingURL=workspace-usage.repository.js.map