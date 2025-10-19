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
var WorkflowRunnerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowRunnerService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const workflow_queue_service_1 = require("./workflow-queue.service");
const workflow_executions_service_1 = require("./workflow-executions.service");
const workflow_webhook_service_1 = require("./workflow-webhook.service");
const workflow_engine_service_1 = require("./workflow-engine.service");
let WorkflowRunnerService = WorkflowRunnerService_1 = class WorkflowRunnerService {
    queueService;
    executionsService;
    webhookService;
    engine;
    logger = new common_1.Logger(WorkflowRunnerService_1.name);
    worker;
    constructor(queueService, executionsService, webhookService, engine) {
        this.queueService = queueService;
        this.executionsService = executionsService;
        this.webhookService = webhookService;
        this.engine = engine;
    }
    async onModuleInit() {
        const queue = this.queueService.getQueue();
        const connection = this.queueService.getConnection();
        if (!queue || !connection) {
            this.logger.log('Workflow runner disabled (queue not available)');
            return;
        }
        this.worker = new bullmq_1.Worker(queue.name, async (job) => {
            const { executionId, workspaceId } = job.data;
            const execution = await this.executionsService.getExecution(executionId);
            if (!execution) {
                this.logger.warn(`Execution ${executionId} not found`);
                return;
            }
            const event = execution.triggerEventId
                ? await this.webhookService.getEvent(execution.triggerEventId)
                : null;
            const items = [
                {
                    json: {
                        ...(event?.query ?? {}),
                        ...(event?.body ?? {}),
                    },
                },
            ];
            await this.engine.runInline({
                workspaceId,
                workflowId: execution.workflowId,
                executionId,
                correlationId: execution.correlationId,
                initialItems: items,
            });
            if (execution.triggerEventId) {
                await this.webhookService.updateEventStatus(execution.triggerEventId, 'processed');
            }
        }, {
            connection,
        });
        this.worker.on('failed', (job, err) => {
            this.logger.error(`Workflow job ${job?.id ?? 'unknown'} failed`, err instanceof Error ? err.stack : err);
        });
    }
    async onModuleDestroy() {
        if (this.worker) {
            await this.worker.close();
        }
    }
};
exports.WorkflowRunnerService = WorkflowRunnerService;
exports.WorkflowRunnerService = WorkflowRunnerService = WorkflowRunnerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workflow_queue_service_1.WorkflowQueueService,
        workflow_executions_service_1.WorkflowExecutionsService,
        workflow_webhook_service_1.WorkflowWebhookService,
        workflow_engine_service_1.WorkflowEngineService])
], WorkflowRunnerService);
//# sourceMappingURL=workflow-runner.service.js.map