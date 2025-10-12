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
};
exports.WorkspaceApiKeysRepository = WorkspaceApiKeysRepository;
exports.WorkspaceApiKeysRepository = WorkspaceApiKeysRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], WorkspaceApiKeysRepository);
//# sourceMappingURL=workspace-api-keys.repository.js.map