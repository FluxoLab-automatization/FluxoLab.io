"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmConfigModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const entities_1 = require("../entities");
const entities_2 = require("../../modules/engine/entities");
const entities_3 = require("../../modules/connectors/entities");
let TypeOrmConfigModule = class TypeOrmConfigModule {
};
exports.TypeOrmConfigModule = TypeOrmConfigModule;
exports.TypeOrmConfigModule = TypeOrmConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    url: config.get('DATABASE_URL', { infer: true }),
                    entities: [
                        entities_1.Execution,
                        entities_1.ExecutionStep,
                        entities_1.Workflow,
                        entities_1.WorkflowVersion,
                        entities_2.SystemEvent,
                        entities_2.IdempotencyKey,
                        entities_2.DistributedLock,
                        entities_2.RetryQueue,
                        entities_2.CircuitBreaker,
                        entities_2.CompensationAction,
                        entities_2.ExecutionWindow,
                        entities_2.ScheduleJob,
                        entities_2.ExecutionMetric,
                        entities_2.Alert,
                        entities_2.AlertNotification,
                        entities_2.AlertHistory,
                        entities_3.Connector,
                        entities_3.ConnectorVersion,
                        entities_3.ConnectorAction,
                        entities_3.Connection,
                        entities_3.ConnectionSecret,
                        entities_3.OAuthToken,
                    ],
                    synchronize: false,
                    logging: config.get('NODE_ENV', { infer: true }) === 'development',
                    ssl: config.get('PG_SSL', { infer: true }) ? { rejectUnauthorized: false } : false,
                }),
            }),
        ],
    })
], TypeOrmConfigModule);
//# sourceMappingURL=typeorm.module.js.map