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
exports.WebhookEventsRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../shared/database/database.service");
let WebhookEventsRepository = class WebhookEventsRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    async recordEvent(params) {
        const result = await this.pool.query(`
        INSERT INTO webhook_events
          (registration_id, event_type, payload, headers, signature_valid, status, error_message)
        VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, $7)
        RETURNING id,
                  registration_id,
                  event_type,
                  status,
                  signature_valid,
                  error_message,
                  received_at
      `, [
            params.registrationId,
            params.eventType,
            params.payload ? JSON.stringify(params.payload) : null,
            params.headers ? JSON.stringify(params.headers) : null,
            params.signatureValid,
            params.status,
            params.errorMessage ?? null,
        ]);
        return result.rows[0];
    }
};
exports.WebhookEventsRepository = WebhookEventsRepository;
exports.WebhookEventsRepository = WebhookEventsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], WebhookEventsRepository);
//# sourceMappingURL=webhook-events.repository.js.map