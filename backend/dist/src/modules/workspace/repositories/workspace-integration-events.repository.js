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
exports.WorkspaceIntegrationEventsRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../shared/database/database.service");
let WorkspaceIntegrationEventsRepository = class WorkspaceIntegrationEventsRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    async recordEvent(params) {
        await this.pool.query(`
        INSERT INTO workspace_integration_events (
          workspace_id,
          integration_type,
          integration_id,
          status,
          payload,
          recorded_by
        )
        VALUES ($1, $2, $3, $4, $5::jsonb, $6)
      `, [
            params.workspaceId,
            params.integrationType,
            params.integrationId ?? null,
            params.status,
            JSON.stringify(params.payload ?? {}),
            params.recordedBy ?? null,
        ]);
    }
    async listRecent(workspaceId, limit = 50) {
        const result = await this.pool.query(`
        SELECT id,
               workspace_id,
               integration_type,
               integration_id,
               status,
               payload,
               recorded_by,
               occurred_at
          FROM workspace_integration_events
         WHERE workspace_id = $1
         ORDER BY occurred_at DESC
         LIMIT $2
      `, [workspaceId, limit]);
        return result.rows;
    }
};
exports.WorkspaceIntegrationEventsRepository = WorkspaceIntegrationEventsRepository;
exports.WorkspaceIntegrationEventsRepository = WorkspaceIntegrationEventsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], WorkspaceIntegrationEventsRepository);
//# sourceMappingURL=workspace-integration-events.repository.js.map