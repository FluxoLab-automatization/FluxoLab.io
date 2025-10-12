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
exports.WebhookRegistrationsRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../shared/database/database.service");
let WebhookRegistrationsRepository = class WebhookRegistrationsRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    async createRegistration(params) {
        const result = await this.pool.query(`
        INSERT INTO webhook_registrations (user_id, token_hash)
        VALUES ($1, $2)
        ON CONFLICT (token_hash) DO NOTHING
        RETURNING id,
                  user_id,
                  token_hash,
                  status,
                  created_at,
                  verified_at,
                  revoked_at,
                  last_used_at
      `, [params.userId, params.tokenHash]);
        if (!result.rowCount) {
            throw new Error('Token hash already exists');
        }
        return result.rows[0];
    }
    async findActiveByTokenHash(tokenHash) {
        const result = await this.pool.query(`
        SELECT id,
               user_id,
               token_hash,
               status,
               created_at,
               verified_at,
               revoked_at,
               last_used_at
        FROM webhook_registrations
        WHERE token_hash = $1
          AND status = 'active'
        LIMIT 1
      `, [tokenHash]);
        return result.rows[0] ?? null;
    }
    async markVerified(id) {
        await this.pool.query(`
        UPDATE webhook_registrations
        SET verified_at = NOW()
        WHERE id = $1
      `, [id]);
    }
    async updateLastUsedAt(id) {
        await this.pool.query(`
        UPDATE webhook_registrations
        SET last_used_at = NOW()
        WHERE id = $1
      `, [id]);
    }
};
exports.WebhookRegistrationsRepository = WebhookRegistrationsRepository;
exports.WebhookRegistrationsRepository = WebhookRegistrationsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], WebhookRegistrationsRepository);
//# sourceMappingURL=webhook-registrations.repository.js.map