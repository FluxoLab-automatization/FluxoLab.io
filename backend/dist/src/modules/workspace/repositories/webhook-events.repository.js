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
exports.WorkspaceWebhookRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../shared/database/database.service");
let WorkspaceWebhookRepository = class WorkspaceWebhookRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    async countRegistrations() {
        const result = await this.pool.query(`
        SELECT COUNT(*)::int AS total
        FROM webhook_registrations
      `);
        return result.rows[0]?.total ?? 0;
    }
    async countEvents() {
        const result = await this.pool.query(`
        SELECT COUNT(*)::int AS total
        FROM webhook_events
      `);
        return result.rows[0]?.total ?? 0;
    }
    async listRecentEvents(limit) {
        const result = await this.pool.query(`
        SELECT id,
               registration_id,
               event_type,
               status,
               signature_valid,
               received_at
        FROM webhook_events
        ORDER BY received_at DESC
        LIMIT $1
      `, [limit]);
        return result.rows;
    }
};
exports.WorkspaceWebhookRepository = WorkspaceWebhookRepository;
exports.WorkspaceWebhookRepository = WorkspaceWebhookRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], WorkspaceWebhookRepository);
//# sourceMappingURL=webhook-events.repository.js.map