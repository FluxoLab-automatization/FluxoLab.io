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
exports.ActivitiesRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../shared/database/database.service");
let ActivitiesRepository = class ActivitiesRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    async listRecentByUser(userId, limit) {
        const result = await this.pool.query(`
        SELECT id,
               user_id,
               entity_type,
               entity_id,
               action,
               payload,
               created_at
        FROM activities
        WHERE user_id = $1
           OR (user_id IS NULL AND entity_type = 'system')
        ORDER BY created_at DESC
        LIMIT $2
      `, [userId, limit]);
        return result.rows;
    }
};
exports.ActivitiesRepository = ActivitiesRepository;
exports.ActivitiesRepository = ActivitiesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ActivitiesRepository);
//# sourceMappingURL=activities.repository.js.map