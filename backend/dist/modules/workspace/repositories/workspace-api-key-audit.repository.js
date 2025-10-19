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
exports.WorkspaceApiKeyAuditRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../shared/database/database.service");
let WorkspaceApiKeyAuditRepository = class WorkspaceApiKeyAuditRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    async recordEvent(params) {
        await this.pool.query(`
        INSERT INTO workspace_api_key_audit (
          api_key_id,
          workspace_id,
          action,
          actor_id,
          ip_address,
          user_agent,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
      `, [
            params.apiKeyId,
            params.workspaceId,
            params.action,
            params.actorId ?? null,
            params.ipAddress ?? null,
            params.userAgent ?? null,
            JSON.stringify(params.metadata ?? {}),
        ]);
    }
    async listRecent(workspaceId, apiKeyId, limit = 50) {
        const result = await this.pool.query(`
        SELECT id,
               api_key_id,
               workspace_id,
               action,
               actor_id,
               ip_address,
               user_agent,
               metadata,
               occurred_at
          FROM workspace_api_key_audit
         WHERE workspace_id = $1
           AND api_key_id = $2
         ORDER BY occurred_at DESC
         LIMIT $3
      `, [workspaceId, apiKeyId, limit]);
        return result.rows;
    }
};
exports.WorkspaceApiKeyAuditRepository = WorkspaceApiKeyAuditRepository;
exports.WorkspaceApiKeyAuditRepository = WorkspaceApiKeyAuditRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], WorkspaceApiKeyAuditRepository);
//# sourceMappingURL=workspace-api-key-audit.repository.js.map