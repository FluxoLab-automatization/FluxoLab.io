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
exports.WorkspaceSettingsRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../shared/database/database.service");
let WorkspaceSettingsRepository = class WorkspaceSettingsRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    mapRow(row) {
        return {
            workspaceId: row.workspace_id,
            preferences: row.preferences ?? {},
            notifications: row.notifications ?? {},
            branding: row.branding ?? {},
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
    async ensureDefaults(workspaceId) {
        await this.pool.query(`
        INSERT INTO workspace_settings (
          workspace_id,
          preferences,
          notifications,
          branding
        )
        VALUES (
          $1,
          jsonb_build_object('timezone', 'America/Sao_Paulo', 'language', 'pt-BR'),
          jsonb_build_object('email', true, 'push', false),
          jsonb_build_object('logo_url', NULL, 'theme', 'dark')
        )
        ON CONFLICT (workspace_id) DO NOTHING
      `, [workspaceId]);
    }
    async updatePreferences(workspaceId, preferences) {
        const result = await this.pool.query(`
        UPDATE workspace_settings
           SET preferences = workspace_settings.preferences || $2::jsonb,
               updated_at = NOW()
         WHERE workspace_id = $1
        RETURNING workspace_id,
                  preferences,
                  notifications,
                  branding,
                  created_at,
                  updated_at
      `, [workspaceId, JSON.stringify(preferences)]);
        return this.mapRow(result.rows[0]);
    }
    async findByWorkspaceId(workspaceId) {
        const result = await this.pool.query(`
        SELECT workspace_id,
               preferences,
               notifications,
               branding,
               created_at,
               updated_at
          FROM workspace_settings
         WHERE workspace_id = $1
         LIMIT 1
      `, [workspaceId]);
        const row = result.rows[0];
        return row ? this.mapRow(row) : null;
    }
};
exports.WorkspaceSettingsRepository = WorkspaceSettingsRepository;
exports.WorkspaceSettingsRepository = WorkspaceSettingsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], WorkspaceSettingsRepository);
//# sourceMappingURL=workspace-settings.repository.js.map