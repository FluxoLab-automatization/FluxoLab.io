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
var WorkflowOrchestratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowOrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const workflow_webhook_service_1 = require("./workflow-webhook.service");
const workflow_executions_service_1 = require("./workflow-executions.service");
const workflows_service_1 = require("./workflows.service");
const workflow_engine_service_1 = require("./workflow-engine.service");
const workflow_response_registry_1 = require("./workflow-response.registry");
const metrics_service_1 = require("../monitoring/metrics.service");
let WorkflowOrchestratorService = WorkflowOrchestratorService_1 = class WorkflowOrchestratorService {
    webhookService;
    executionsService;
    workflowsService;
    engine;
    responseRegistry;
    metrics;
    logger = new common_1.Logger(WorkflowOrchestratorService_1.name);
    constructor(webhookService, executionsService, workflowsService, engine, responseRegistry, metrics) {
        this.webhookService = webhookService;
        this.executionsService = executionsService;
        this.workflowsService = workflowsService;
        this.engine = engine;
        this.responseRegistry = responseRegistry;
        this.metrics = metrics;
    }
    async triggerViaWebhook(payload) {
        const registration = await this.webhookService.getRegistrationByToken(payload.token);
        const correlationId = (0, crypto_1.randomUUID)();
        const eventId = await this.webhookService.recordEvent({
            workspaceId: registration.workspaceId,
            webhookId: registration.id,
            correlationId,
            method: payload.method,
            headers: payload.headers,
            query: payload.query,
            body: payload.body,
            rawBody: payload.rawBody ?? null,
            signature: null,
            idempotencyKey: payload.idempotencyKey ?? null,
            status: 'received',
        });
        const version = await this.workflowsService.getActiveVersion(registration.workspaceId, registration.workflowId);
        const execution = await this.executionsService.createExecution({
            workspaceId: registration.workspaceId,
            workflowId: registration.workflowId,
            workflowVersionId: version.id,
            triggerEventId: eventId,
            correlationId,
        });
        this.metrics.incrementCounter('workflow_triggers_total', {
            trigger_type: 'webhook',
            workflow_id: registration.workflowId,
            workspace_id: registration.workspaceId,
        });
        if (registration.respondMode === 'immediate' && payload.respond) {
            payload.respond(202, {
                status: 'accepted',
                executionId: execution.id,
            });
        }
        if (registration.respondMode === 'via_node' && payload.respond) {
            this.responseRegistry.register(correlationId, {
                resolve: (status, body) => payload.respond?.(status, body),
                reject: (err) => {
                    this.logger.error('Failed to respond to webhook', err);
                    payload.respond?.(500, { status: 'error', message: 'Internal error' });
                },
            });
        }
        const startedAt = Date.now();
        try {
            await this.engine.runInline({
                workspaceId: registration.workspaceId,
                workflowId: registration.workflowId,
                executionId: execution.id,
                correlationId,
                initialItems: [
                    {
                        json: {
                            ...(payload.query ?? {}),
                            ...(payload.body ?? {}),
                        },
                    },
                ],
            });
            const durationSeconds = (Date.now() - startedAt) / 1000;
            this.metrics.incrementCounter('workflow_executions_total', {
                trigger_type: 'webhook',
                workflow_id: registration.workflowId,
                workspace_id: registration.workspaceId,
                status: 'succeeded',
            });
            this.metrics.recordHistogram('workflow_execution_duration_seconds', durationSeconds, {
                trigger_type: 'webhook',
                workflow_id: registration.workflowId,
            });
        }
        catch (error) {
            this.metrics.incrementCounter('workflow_executions_total', {
                trigger_type: 'webhook',
                workflow_id: registration.workflowId,
                workspace_id: registration.workspaceId,
                status: 'failed',
            });
            this.metrics.recordError('workflow_execution_failed', 'workflows');
            throw error;
        }
        if (registration.respondMode === 'on_last_node' && payload.respond) {
            payload.respond(200, {
                status: 'completed',
                executionId: execution.id,
            });
        }
        return { executionId: execution.id };
    }
};
exports.WorkflowOrchestratorService = WorkflowOrchestratorService;
exports.WorkflowOrchestratorService = WorkflowOrchestratorService = WorkflowOrchestratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workflow_webhook_service_1.WorkflowWebhookService,
        workflow_executions_service_1.WorkflowExecutionsService,
        workflows_service_1.WorkflowsService,
        workflow_engine_service_1.WorkflowEngineService,
        workflow_response_registry_1.WorkflowResponseRegistry,
        metrics_service_1.MetricsService])
], WorkflowOrchestratorService);
//# sourceMappingURL=workflow-orchestrator.service.js.map