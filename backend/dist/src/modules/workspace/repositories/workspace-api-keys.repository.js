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
exports.WorkspaceApiKeysRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../shared/database/database.service");
let WorkspaceApiKeysRepository = class WorkspaceApiKeysRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    async listActive(workspaceId) {
        const result = await this.pool.query(`
        SELECT k.id,
               k.workspace_id,
               k.label,
               k.key_preview,
               k.scopes,
               k.status,
               k.created_by,
               u.email AS created_by_email,
               k.metadata,
               k.last_used_at,
               k.expires_at,
               k.revoked_at,
               k.created_at,
               k.updated_at
          FROM workspace_api_keys k
          LEFT JOIN users u ON u.id = k.created_by
         WHERE k.workspace_id = $1
         ORDER BY k.created_at DESC
      `, [workspaceId]);
        return result.rows;
    }
    async findById(workspaceId, apiKeyId) {
        const result = await this.pool.query(`
        SELECT k.id,
               k.workspace_id,
               k.label,
               k.key_preview,
               k.scopes,
               k.status,
               k.created_by,
               u.email AS created_by_email,
               k.metadata,
               k.last_used_at,
               k.expires_at,
               k.revoked_at,
               k.created_at,
               k.updated_at
          FROM workspace_api_keys k
          LEFT JOIN users u ON u.id = k.created_by
         WHERE k.workspace_id = $1
           AND k.id = $2
         LIMIT 1
      `, [workspaceId, apiKeyId]);
        const row = result.rows[0];
        return row ?? null;
    }
    async createKey(params) {
        const result = await this.pool.query(`
        INSERT INTO workspace_api_keys (
          workspace_id,
          label,
          key_hash,
          key_preview,
          scopes,
          created_by,
          metadata,
          expires_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
        RETURNING id,
                  workspace_id,
                  label,
                  key_preview,
                  scopes,
                  status,
                  created_by,
                  metadata,
                  last_used_at,
                  expires_at,
                  revoked_at,
                  created_at,
                  updated_at
      `, [
            params.workspaceId,
            params.label,
            params.keyHash,
            params.keyPreview,
            params.scopes,
            params.createdBy ?? null,
            JSON.stringify(params.metadata ?? {}),
            params.expiresAt ?? null,
        ]);
        return result.rows[0];
    }
    async revokeKey(workspaceId, apiKeyId) {
        await this.pool.query(`
        UPDATE workspace_api_keys
           SET status = 'revoked',
               revoked_at = NOW(),
               updated_at = NOW()
         WHERE workspace_id = $1
           AND id = $2
      `, [workspaceId, apiKeyId]);
    }
    async updateKeySecret(params) {
        await this.pool.query(`
        UPDATE workspace_api_keys
           SET key_hash = $3,
               key_preview = $4,
               metadata = workspace_api_keys.metadata || $5::jsonb,
               updated_at = NOW()
         WHERE workspace_id = $1
           AND id = $2
      `, [
            params.workspaceId,
            params.apiKeyId,
            params.keyHash,
            params.keyPreview,
            JSON.stringify(params.metadata ?? {}),
        ]);
    }
};
exports.WorkspaceApiKeysRepository = WorkspaceApiKeysRepository;
exports.WorkspaceApiKeysRepository = WorkspaceApiKeysRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], WorkspaceApiKeysRepository);
//# sourceMappingURL=workspace-api-keys.repository.js.map