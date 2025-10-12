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
exports.WorkspaceMembersRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../shared/database/database.service");
let WorkspaceMembersRepository = class WorkspaceMembersRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    mapRow(row) {
        return {
            id: row.id,
            workspaceId: row.workspace_id,
            userId: row.user_id,
            profileId: row.profile_id,
            invitedBy: row.invited_by,
            status: row.status,
            joinedAt: row.joined_at,
            leftAt: row.left_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
    async addOrActivateMember(params) {
        const result = await this.pool.query(`
        INSERT INTO workspace_members (
          workspace_id,
          user_id,
          profile_id,
          invited_by,
          status,
          joined_at
        )
        VALUES ($1, $2, $3, $4, 'active', NOW())
        ON CONFLICT (workspace_id, user_id) DO UPDATE
           SET profile_id = EXCLUDED.profile_id,
               invited_by = EXCLUDED.invited_by,
               status = 'active',
               joined_at = COALESCE(workspace_members.joined_at, NOW()),
               left_at = NULL,
               updated_at = NOW()
        RETURNING id,
                  workspace_id,
                  user_id,
                  profile_id,
                  invited_by,
                  status,
                  joined_at,
                  left_at,
                  created_at,
                  updated_at
      `, [
            params.workspaceId,
            params.userId,
            params.profileId,
            params.invitedBy ?? null,
        ]);
        return this.mapRow(result.rows[0]);
    }
    async countActive(workspaceId) {
        const result = await this.pool.query(`
        SELECT COUNT(*)::int AS total
          FROM workspace_members
         WHERE workspace_id = $1
           AND status = 'active'
      `, [workspaceId]);
        return result.rows[0]?.total ?? 0;
    }
};
exports.WorkspaceMembersRepository = WorkspaceMembersRepository;
exports.WorkspaceMembersRepository = WorkspaceMembersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], WorkspaceMembersRepository);
//# sourceMappingURL=workspace-members.repository.js.map