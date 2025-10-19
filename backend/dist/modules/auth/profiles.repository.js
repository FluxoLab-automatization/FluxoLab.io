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
exports.ProfilesRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../shared/database/database.service");
let ProfilesRepository = class ProfilesRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    async findByCode(code) {
        const result = await this.pool.query(`
        SELECT id,
               code,
               name,
               description,
               scope,
               created_at,
               updated_at
          FROM profiles
         WHERE code = $1
         LIMIT 1
      `, [code]);
        return result.rows[0] ?? null;
    }
    async getRequiredProfileId(code) {
        const profile = await this.findByCode(code);
        if (!profile) {
            throw new common_1.NotFoundException(`Perfil ${code} nao encontrado`);
        }
        return profile.id;
    }
    async assignGlobalProfile(params) {
        const profileId = await this.getRequiredProfileId(params.profileCode);
        await this.pool.query(`
        INSERT INTO user_profiles (user_id, profile_id, scope, assigned_by)
        VALUES ($1, $2, 'global', $3)
        ON CONFLICT (user_id, profile_id, scope) DO UPDATE
           SET assigned_by = EXCLUDED.assigned_by,
               assigned_at = NOW()
      `, [params.userId, profileId, params.assignedBy ?? null]);
    }
    async listWorkspaceProfiles() {
        const result = await this.pool.query(`
        SELECT id,
               code,
               name,
               description,
               scope,
               created_at,
               updated_at
          FROM profiles
         WHERE scope = 'workspace'
         ORDER BY name ASC
      `);
        return result.rows;
    }
};
exports.ProfilesRepository = ProfilesRepository;
exports.ProfilesRepository = ProfilesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ProfilesRepository);
//# sourceMappingURL=profiles.repository.js.map