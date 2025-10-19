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
exports.UsersRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../shared/database/database.service");
let UsersRepository = class UsersRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    async findByEmail(email) {
        const result = await this.pool.query(`
        SELECT
          u.id,
          u.email,
          u.display_name,
          u.avatar_color,
          u.password_hash,
          u.created_at,
          u.updated_at,
          u.last_login_at,
          COALESCE(
            u.default_workspace_id,
            (
              SELECT wm.workspace_id
              FROM workspace_members wm
              WHERE wm.user_id = u.id
                AND wm.status = 'active'
              ORDER BY wm.created_at ASC
              LIMIT 1
            ),
            (
              SELECT w.id
              FROM workspaces w
              WHERE w.owner_id = u.id
              ORDER BY w.created_at ASC
              LIMIT 1
            )
          ) AS default_workspace_id
        FROM users u
        WHERE u.email = $1
        LIMIT 1
      `, [email.toLowerCase()]);
        return result.rows[0] ?? null;
    }
    async findById(id) {
        const result = await this.pool.query(`
        WITH candidate AS (
          SELECT
            wm.workspace_id,
            ROW_NUMBER() OVER (ORDER BY wm.created_at ASC) AS rank
          FROM workspace_members wm
          WHERE wm.user_id = $1
            AND wm.status = 'active'
          UNION ALL
          SELECT
            w.id AS workspace_id,
            999 AS rank
          FROM workspaces w
          WHERE w.owner_id = $1
        ),
        default_ws AS (
          SELECT workspace_id
          FROM candidate
          ORDER BY rank ASC
          LIMIT 1
        )
        SELECT
          u.id,
          u.email,
          u.display_name,
          u.avatar_color,
          u.password_hash,
          u.created_at,
          u.updated_at,
          u.last_login_at,
          COALESCE(
            u.default_workspace_id,
            (
              SELECT wm.workspace_id
              FROM workspace_members wm
              WHERE wm.user_id = u.id
                AND wm.status = 'active'
              ORDER BY wm.created_at ASC
              LIMIT 1
            ),
            (
              SELECT w.id
              FROM workspaces w
              WHERE w.owner_id = u.id
              ORDER BY w.created_at ASC
              LIMIT 1
            )
          ) AS default_workspace_id
        FROM users u
        WHERE u.id = $1
        LIMIT 1
      `, [id]);
        return result.rows[0] ?? null;
    }
    async createUser({ email, passwordHash, displayName, avatarColor, }) {
        const result = await this.pool.query(`
        INSERT INTO users (email, password_hash, display_name, avatar_color)
        VALUES ($1, $2, $3, $4)
        RETURNING id,
                  email,
                  password_hash,
                  display_name,
                  avatar_color,
                  created_at,
                  updated_at,
                  last_login_at
      `, [email.toLowerCase(), passwordHash, displayName, avatarColor]);
        return result.rows[0];
    }
    async touchLastLogin(id) {
        await this.pool.query(`
        UPDATE users
        SET last_login_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
      `, [id]);
    }
    async setDefaultWorkspace(userId, workspaceId) {
        await this.pool.query(`
        UPDATE users
           SET default_workspace_id = $2,
               updated_at = NOW()
         WHERE id = $1
      `, [userId, workspaceId]);
    }
};
exports.UsersRepository = UsersRepository;
exports.UsersRepository = UsersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], UsersRepository);
//# sourceMappingURL=users.repository.js.map