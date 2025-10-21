"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowsModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const monitoring_module_1 = require("../monitoring/monitoring.module");
const whatsapp_module_1 = require("../whatsapp/whatsapp.module");
const workflows_service_1 = require("./workflows.service");
const workflow_credentials_service_1 = require("./workflow-credentials.service");
const workflow_executions_service_1 = require("./workflow-executions.service");
const workflow_webhook_service_1 = require("./workflow-webhook.service");
const workflow_response_registry_1 = require("./workflow-response.registry");
const workflow_engine_service_1 = require("./workflow-engine.service");
const workflow_runner_service_1 = require("./workflow-runner.service");
const workflow_orchestrator_service_1 = require("./workflow-orchestrator.service");
const workflows_controller_1 = require("./workflows.controller");
const workflow_credentials_controller_1 = require("./workflow-credentials.controller");
const workflows_processor_1 = require("./workflows.processor");
const workflow_queue_service_1 = require("./workflow-queue.service");
let WorkflowsModule = class WorkflowsModule {
};
exports.WorkflowsModule = WorkflowsModule;
exports.WorkflowsModule = WorkflowsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            monitoring_module_1.MonitoringModule,
            whatsapp_module_1.WhatsappModule,
            bull_1.BullModule.registerQueue({ name: 'workflows' }),
        ],
        controllers: [workflows_controller_1.WorkflowsController, workflow_credentials_controller_1.WorkflowCredentialsController],
        providers: [
            workflows_service_1.WorkflowsService,
            workflow_credentials_service_1.WorkflowCredentialsService,
            workflow_executions_service_1.WorkflowExecutionsService,
            workflow_webhook_service_1.WorkflowWebhookService,
            workflow_response_registry_1.WorkflowResponseRegistry,
            workflow_engine_service_1.WorkflowEngineService,
            workflow_runner_service_1.WorkflowRunnerService,
            workflow_orchestrator_service_1.WorkflowOrchestratorService,
            workflow_queue_service_1.WorkflowQueueService,
            workflows_processor_1.WorkflowsProcessor,
        ],
        exports: [
            workflows_service_1.WorkflowsService,
            workflow_credentials_service_1.WorkflowCredentialsService,
            workflow_executions_service_1.WorkflowExecutionsService,
            workflow_webhook_service_1.WorkflowWebhookService,
            workflow_response_registry_1.WorkflowResponseRegistry,
            workflow_engine_service_1.WorkflowEngineService,
            workflow_runner_service_1.WorkflowRunnerService,
            workflow_orchestrator_service_1.WorkflowOrchestratorService,
            workflow_queue_service_1.WorkflowQueueService,
        ],
    })
], WorkflowsModule);
//# sourceMappingURL=workflows.module.js.map