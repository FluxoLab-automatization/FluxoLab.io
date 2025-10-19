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
exports.WorkspaceUsageAlertsRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../shared/database/database.service");
let WorkspaceUsageAlertsRepository = class WorkspaceUsageAlertsRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    async listByWorkspace(workspaceId) {
        const result = await this.pool.query(`
        SELECT id,
               workspace_id,
               metric,
               threshold,
               condition,
               window_size AS window,
               channel,
               enabled,
               created_by,
               metadata,
               last_triggered_at,
               created_at,
               updated_at
          FROM workspace_usage_alerts
         WHERE workspace_id = $1
         ORDER BY created_at DESC
      `, [workspaceId]);
        return result.rows;
    }
    async createAlert(params) {
        const result = await this.pool.query(`
        INSERT INTO workspace_usage_alerts (
          workspace_id,
          metric,
          threshold,
          condition,
          window_size,
          channel,
          created_by,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
        RETURNING id,
                  workspace_id,
                  metric,
                  threshold,
                  condition,
                  window_size AS window,
                  channel,
                  enabled,
                  created_by,
                  metadata,
                  last_triggered_at,
                  created_at,
                  updated_at
      `, [
            params.workspaceId,
            params.metric,
            params.threshold,
            params.condition,
            params.window ?? '24h',
            params.channel ?? 'email',
            params.createdBy ?? null,
            JSON.stringify(params.metadata ?? {}),
        ]);
        return result.rows[0];
    }
    async setEnabled(alertId, enabled) {
        await this.pool.query(`
        UPDATE workspace_usage_alerts
           SET enabled = $2,
               updated_at = NOW()
         WHERE id = $1
      `, [alertId, enabled]);
    }
    async deleteAlert(alertId) {
        await this.pool.query(`
        DELETE FROM workspace_usage_alerts
         WHERE id = $1
      `, [alertId]);
    }
    async touchTriggered(alertId) {
        await this.pool.query(`
        UPDATE workspace_usage_alerts
           SET last_triggered_at = NOW(),
               updated_at = NOW()
         WHERE id = $1
      `, [alertId]);
    }
};
exports.WorkspaceUsageAlertsRepository = WorkspaceUsageAlertsRepository;
exports.WorkspaceUsageAlertsRepository = WorkspaceUsageAlertsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], WorkspaceUsageAlertsRepository);
//# sourceMappingURL=workspace-usage-alerts.repository.js.map