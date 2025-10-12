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
exports.UserSettingsRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../shared/database/database.service");
let UserSettingsRepository = class UserSettingsRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    async ensureUserSettings(params) {
        await this.pool.query(`
        INSERT INTO user_settings (user_id, first_name, last_name)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO UPDATE
           SET first_name = COALESCE(EXCLUDED.first_name, user_settings.first_name),
               last_name = COALESCE(EXCLUDED.last_name, user_settings.last_name),
               updated_at = NOW()
      `, [params.userId, params.firstName ?? null, params.lastName ?? null]);
    }
};
exports.UserSettingsRepository = UserSettingsRepository;
exports.UserSettingsRepository = UserSettingsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], UserSettingsRepository);
//# sourceMappingURL=user-settings.repository.js.map