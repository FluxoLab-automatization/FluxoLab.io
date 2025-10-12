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
exports.WorkspacesRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../shared/database/database.service");
let WorkspacesRepository = class WorkspacesRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    normalize(row) {
        return {
            id: row.id,
            ownerId: row.owner_id,
            planId: row.plan_id,
            name: row.name,
            slug: row.slug,
            status: row.status,
            timezone: row.timezone,
            region: row.region,
            settings: row.settings ?? {},
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
    slugify(input) {
        const base = input
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-{2,}/g, '-');
        return base.length > 0 ? base : 'workspace';
    }
    async slugExists(slug) {
        const result = await this.pool.query(`
        SELECT EXISTS(
          SELECT 1
            FROM workspaces
           WHERE slug = $1
        ) AS exists
      `, [slug]);
        return Boolean(result.rows[0]?.exists);
    }
    async generateUniqueSlug(name) {
        const base = this.slugify(name);
        let slug = base;
        let counter = 2;
        while (await this.slugExists(slug)) {
            slug = `${base}-${counter}`;
            counter += 1;
            if (counter > 99) {
                slug = `${base}-${Date.now()}`;
                break;
            }
        }
        return slug;
    }
    async createWorkspace(params) {
        const result = await this.pool.query(`
        INSERT INTO workspaces (
          owner_id,
          plan_id,
          name,
          slug,
          timezone,
          region,
          settings
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
        RETURNING id,
                  owner_id,
                  plan_id,
                  name,
                  slug,
                  status,
                  timezone,
                  region,
                  settings,
                  created_at,
                  updated_at
      `, [
            params.ownerId,
            params.planId,
            params.name,
            params.slug,
            params.timezone ?? 'America/Sao_Paulo',
            params.region ?? null,
            JSON.stringify(params.settings ?? {}),
        ]);
        return this.normalize(result.rows[0]);
    }
    async findById(id) {
        const result = await this.pool.query(`
        SELECT id,
               owner_id,
               plan_id,
               name,
               slug,
               status,
               timezone,
               region,
               settings,
               created_at,
               updated_at
          FROM workspaces
         WHERE id = $1
         LIMIT 1
      `, [id]);
        const row = result.rows[0];
        return row ? this.normalize(row) : null;
    }
    async findBySlug(slug) {
        const result = await this.pool.query(`
        SELECT id,
               owner_id,
               plan_id,
               name,
               slug,
               status,
               timezone,
               region,
               settings,
               created_at,
               updated_at
          FROM workspaces
         WHERE slug = $1
         LIMIT 1
      `, [slug]);
        const row = result.rows[0];
        return row ? this.normalize(row) : null;
    }
    async updatePlan(workspaceId, planId) {
        await this.pool.query(`
        UPDATE workspaces
           SET plan_id = $2,
               updated_at = NOW()
         WHERE id = $1
      `, [workspaceId, planId]);
    }
    async findDefaultForUser(userId) {
        const result = await this.pool.query(`
        WITH candidate AS (
          SELECT w.*,
                 ROW_NUMBER() OVER (ORDER BY w.created_at ASC) AS owner_rank
            FROM workspaces w
           WHERE w.owner_id = $1
          UNION ALL
          SELECT w.*,
                 ROW_NUMBER() OVER (ORDER BY wm.created_at ASC) + 1000 AS member_rank
            FROM workspaces w
            JOIN workspace_members wm
              ON wm.workspace_id = w.id
           WHERE wm.user_id = $1
             AND wm.status = 'active'
        )
        SELECT *
          FROM candidate
         ORDER BY owner_rank
         LIMIT 1
      `, [userId]);
        const row = result.rows[0];
        return row ? this.normalize(row) : null;
    }
};
exports.WorkspacesRepository = WorkspacesRepository;
exports.WorkspacesRepository = WorkspacesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], WorkspacesRepository);
//# sourceMappingURL=workspaces.repository.js.map