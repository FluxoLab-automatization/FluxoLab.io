"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const typeorm_1 = require("@nestjs/typeorm");
const database_module_1 = require("../../shared/database/database.module");
const engine_service_1 = require("./engine.service");
const engine_controller_1 = require("./engine.controller");
const event_processor_1 = require("./processors/event.processor");
const workflow_processor_1 = require("./processors/workflow.processor");
const human_task_processor_1 = require("./processors/human-task.processor");
const evidence_processor_1 = require("./processors/evidence.processor");
const usage_processor_1 = require("./processors/usage.processor");
const audit_processor_1 = require("./processors/audit.processor");
const entities_1 = require("./entities");
const entities_2 = require("../../shared/entities");
let EngineModule = class EngineModule {
};
exports.EngineModule = EngineModule;
exports.EngineModule = EngineModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_module_1.DatabaseModule,
            typeorm_1.TypeOrmModule.forFeature([
                entities_2.Execution,
                entities_2.ExecutionStep,
                entities_2.Workflow,
                entities_2.WorkflowVersion,
                entities_1.SystemEvent,
                entities_1.IdempotencyKey,
                entities_1.DistributedLock,
                entities_1.RetryQueue,
            ]),
            bull_1.BullModule.registerQueue({ name: 'events' }, { name: 'workflows' }, { name: 'human-tasks' }, { name: 'evidence' }, { name: 'usage' }, { name: 'audit' }),
        ],
        providers: [
            engine_service_1.EngineService,
            event_processor_1.EventProcessor,
            workflow_processor_1.WorkflowProcessor,
            human_task_processor_1.HumanTaskProcessor,
            evidence_processor_1.EvidenceProcessor,
            usage_processor_1.UsageProcessor,
            audit_processor_1.AuditProcessor,
        ],
        controllers: [engine_controller_1.EngineController],
        exports: [engine_service_1.EngineService],
    })
], EngineModule);
//# sourceMappingURL=engine.module.js.map