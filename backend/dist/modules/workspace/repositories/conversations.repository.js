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
exports.ConversationsRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../shared/database/database.service");
let ConversationsRepository = class ConversationsRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    async listRecentByOwner(ownerId, limit) {
        const result = await this.pool.query(`
        SELECT id,
               owner_id,
               title,
               status,
               metadata,
               created_at,
               updated_at
        FROM conversations
        WHERE owner_id = $1
        ORDER BY updated_at DESC
        LIMIT $2
      `, [ownerId, limit]);
        return result.rows;
    }
    async countByOwner(ownerId) {
        const result = await this.pool.query(`
        SELECT COUNT(*)::int AS total
        FROM conversations
        WHERE owner_id = $1
      `, [ownerId]);
        return result.rows[0]?.total ?? 0;
    }
};
exports.ConversationsRepository = ConversationsRepository;
exports.ConversationsRepository = ConversationsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ConversationsRepository);
//# sourceMappingURL=conversations.repository.js.map