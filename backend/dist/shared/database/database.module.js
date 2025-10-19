"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pg_1 = require("pg");
const database_constants_1 = require("./database.constants");
const database_service_1 = require("./database.service");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: database_constants_1.PG_POOL,
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const pool = new pg_1.Pool({
                        connectionString: config.get('DATABASE_URL', { infer: true }),
                        max: config.get('PG_POOL_MAX', { infer: true }),
                        idleTimeoutMillis: config.get('PG_IDLE_TIMEOUT_MS', { infer: true }),
                        ssl: config.get('PG_SSL', { infer: true })
                            ? { rejectUnauthorized: false }
                            : undefined,
                    });
                    pool.on('error', (err) => {
                        console.error('Unexpected Postgres pool error', err);
                    });
                    return pool;
                },
            },
            database_service_1.DatabaseService,
        ],
        exports: [database_constants_1.PG_POOL, database_service_1.DatabaseService],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map