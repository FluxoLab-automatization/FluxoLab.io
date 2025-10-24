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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bull_1 = require("@nestjs/bull");
const uuid_1 = require("uuid");
const entities_1 = require("../../shared/entities");
const entities_2 = require("./entities");
const event_processor_1 = require("./processors/event.processor");
const human_task_processor_1 = require("./processors/human-task.processor");
const evidence_processor_1 = require("./processors/evidence.processor");
const usage_processor_1 = require("./processors/usage.processor");
const audit_processor_1 = require("./processors/audit.processor");
let EngineService = EngineService_1 = class EngineService {
    executionRepository;
    executionStepRepository;
    workflowRepository;
    workflowVersionRepository;
    systemEventRepository;
    idempotencyKeyRepository;
    distributedLockRepository;
    retryQueueRepository;
    eventsQueue;
    workflowsQueue;
    humanTasksQueue;
    evidenceQueue;
    usageQueue;
    auditQueue;
    eventProcessor;
    humanTaskProcessor;
    evidenceProcessor;
    usageProcessor;
    auditProcessor;
    logger = new common_1.Logger(EngineService_1.name);
    constructor(executionRepository, executionStepRepository, workflowRepository, workflowVersionRepository, systemEventRepository, idempotencyKeyRepository, distributedLockRepository, retryQueueRepository, eventsQueue, workflowsQueue, humanTasksQueue, evidenceQueue, usageQueue, auditQueue, eventProcessor, humanTaskProcessor, evidenceProcessor, usageProcessor, auditProcessor) {
        this.executionRepository = executionRepository;
        this.executionStepRepository = executionStepRepository;
        this.workflowRepository = workflowRepository;
        this.workflowVersionRepository = workflowVersionRepository;
        this.systemEventRepository = systemEventRepository;
        this.idempotencyKeyRepository = idempotencyKeyRepository;
        this.distributedLockRepository = distributedLockRepository;
        this.retryQueueRepository = retryQueueRepository;
        this.eventsQueue = eventsQueue;
        this.workflowsQueue = workflowsQueue;
        this.humanTasksQueue = humanTasksQueue;
        this.evidenceQueue = evidenceQueue;
        this.usageQueue = usageQueue;
        this.auditQueue = auditQueue;
        this.eventProcessor = eventProcessor;
        this.humanTaskProcessor = humanTaskProcessor;
        this.evidenceProcessor = evidenceProcessor;
        this.usageProcessor = usageProcessor;
        this.auditProcessor = auditProcessor;
    }
    async startWorkflowExecution(workflowId, triggerData, context) {
        const runId = (0, uuid_1.v4)();
        const correlationId = context.correlationId || (0, uuid_1.v4)();
        const traceId = context.traceId || (0, uuid_1.v4)();
        try {
            const workflow = await this.workflowRepository.findOne({
                where: { id: workflowId, workspaceId: context.workspaceId },
                relations: ['activeVersion']
            });
            if (!workflow) {
                throw new Error(`Workflow ${workflowId} not found`);
            }
            if (!workflow.activeVersion) {
                throw new Error(`No active version for workflow ${workflowId}`);
            }
            const execution = this.executionRepository.create({
                id: runId,
                workflowId,
                workspaceId: context.workspaceId,
                tenantId: context.tenantId,
                status: 'queued',
                triggerData,
                correlationId,
                traceId,
                startedAt: new Date(),
            });
            await this.executionRepository.save(execution);
            await this.emitEvent('flx.run.started', {
                runId,
                workflowId,
                workspaceId: context.workspaceId,
                tenantId: context.tenantId,
                correlationId,
                traceId,
                triggerData
            });
            await this.workflowsQueue.add('process-workflow', {
                runId,
                workflowId,
                versionId: workflow.activeVersion.id,
                triggerData,
                context
            });
            this.logger.log(`Workflow execution started: ${runId}`);
            return runId;
        }
        catch (error) {
            this.logger.error(`Failed to start workflow execution: ${error.message}`, error.stack);
            throw error;
        }
    }
    async processWorkflowExecution(runId, workflowId, versionId, triggerData, context) {
        try {
            const execution = await this.executionRepository.findOne({
                where: { id: runId },
                relations: ['workflow', 'workflow.activeVersion']
            });
            if (!execution) {
                throw new Error(`Execution ${runId} not found`);
            }
            execution.status = 'running';
            await this.executionRepository.save(execution);
            await this.emitEvent('flx.run.running', {
                runId,
                workflowId,
                workspaceId: context.workspaceId,
                tenantId: context.tenantId,
                correlationId: context.correlationId,
                traceId: context.traceId
            });
            const version = await this.workflowVersionRepository.findOne({
                where: { id: versionId },
                relations: ['nodes', 'edges']
            });
            if (!version) {
                throw new Error(`Workflow version ${versionId} not found`);
            }
            await this.workflowsQueue.add('process-workflow-nodes', {
                runId,
                version,
                triggerData,
                context
            });
        }
        catch (error) {
            this.logger.error(`Failed to process workflow execution: ${error.message}`, error.stack);
            await this.executionRepository.update(runId, {
                status: 'failed',
                finishedAt: new Date(),
                errorMessage: error.message
            });
            await this.emitEvent('flx.run.failed', {
                runId,
                workflowId,
                workspaceId: context.workspaceId,
                tenantId: context.tenantId,
                correlationId: context.correlationId,
                traceId: context.traceId,
                error: error.message
            });
        }
    }
    async processNode(runId, nodeId, nodeData, inputData, context) {
        try {
            const step = this.executionStepRepository.create({
                id: (0, uuid_1.v4)(),
                executionId: runId,
                nodeId,
                nodeName: nodeData.name,
                nodeType: nodeData.type,
                status: 'running',
                inputItems: inputData,
                startedAt: new Date(),
            });
            await this.executionStepRepository.save(step);
            await this.emitEvent('flx.step.started', {
                runId,
                stepId: step.id,
                nodeId,
                nodeType: nodeData.type,
                workspaceId: context.workspaceId,
                tenantId: context.tenantId,
                correlationId: context.correlationId,
                traceId: context.traceId
            });
            let outputData;
            switch (nodeData.type) {
                case 'webhook':
                    outputData = await this.processWebhookNode(nodeData, inputData, context);
                    break;
                case 'connector':
                    outputData = await this.processConnectorNode(nodeData, inputData, context);
                    break;
                case 'ai':
                    outputData = await this.processAiNode(nodeData, inputData, context);
                    break;
                case 'human_task':
                    outputData = await this.processHumanTaskNode(nodeData, inputData, context);
                    break;
                case 'transform':
                    outputData = await this.processTransformNode(nodeData, inputData, context);
                    break;
                case 'condition':
                    outputData = await this.processConditionNode(nodeData, inputData, context);
                    break;
                default:
                    throw new Error(`Unknown node type: ${nodeData.type}`);
            }
            step.status = 'succeeded';
            step.outputItems = outputData;
            step.finishedAt = new Date();
            await this.executionStepRepository.save(step);
            await this.emitEvent('flx.step.succeeded', {
                runId,
                stepId: step.id,
                nodeId,
                nodeType: nodeData.type,
                workspaceId: context.workspaceId,
                tenantId: context.tenantId,
                correlationId: context.correlationId,
                traceId: context.traceId,
                outputData
            });
            return outputData;
        }
        catch (error) {
            this.logger.error(`Failed to process node ${nodeId}: ${error.message}`, error.stack);
            await this.executionStepRepository.update({ executionId: runId, nodeId }, {
                status: 'failed',
                finishedAt: new Date(),
                errorMessage: error.message
            });
            await this.emitEvent('flx.step.failed', {
                runId,
                nodeId,
                nodeType: nodeData.type,
                workspaceId: context.workspaceId,
                tenantId: context.tenantId,
                correlationId: context.correlationId,
                traceId: context.traceId,
                error: error.message
            });
            throw error;
        }
    }
    async processWebhookNode(nodeData, inputData, context) {
        return { success: true, data: inputData };
    }
    async processConnectorNode(nodeData, inputData, context) {
        return { success: true, data: inputData };
    }
    async processAiNode(nodeData, inputData, context) {
        return { success: true, data: inputData };
    }
    async processHumanTaskNode(nodeData, inputData, context) {
        return { success: true, data: inputData };
    }
    async processTransformNode(nodeData, inputData, context) {
        return { success: true, data: inputData };
    }
    async processConditionNode(nodeData, inputData, context) {
        return { success: true, data: inputData };
    }
    async emitEvent(eventType, payload) {
        try {
            const event = this.systemEventRepository.create({
                eventType,
                tenantId: payload.tenantId,
                workspaceId: payload.workspaceId,
                runId: payload.runId,
                correlationId: payload.correlationId,
                traceId: payload.traceId,
                payload,
                checksum: this.calculateChecksum(payload)
            });
            await this.systemEventRepository.save(event);
            await this.eventsQueue.add('process-event', {
                eventId: event.id,
                eventType,
                payload
            });
        }
        catch (error) {
            this.logger.error(`Failed to emit event ${eventType}: ${error.message}`, error.stack);
        }
    }
    calculateChecksum(data) {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
    }
    async checkIdempotency(tenantId, workspaceId, scope, key) {
        const existing = await this.idempotencyKeyRepository.findOne({
            where: { tenantId, workspaceId, scope, key }
        });
        return existing !== null;
    }
    async createIdempotencyKey(tenantId, workspaceId, scope, key, runId, expiresAt) {
        const idempotencyKey = this.idempotencyKeyRepository.create({
            tenantId,
            workspaceId,
            scope,
            key,
            runId,
            expiresAt
        });
        await this.idempotencyKeyRepository.save(idempotencyKey);
    }
    async acquireLock(lockKey, lockedBy, ttlSeconds) {
        try {
            const lock = this.distributedLockRepository.create({
                lockKey,
                lockedBy,
                expiresAt: new Date(Date.now() + ttlSeconds * 1000)
            });
            await this.distributedLockRepository.save(lock);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async releaseLock(lockKey, lockedBy) {
        await this.distributedLockRepository.delete({
            lockKey,
            lockedBy
        });
    }
    async addToRetryQueue(runId, stepId, errorMessage, maxRetries = 3) {
        const retryItem = this.retryQueueRepository.create({
            runId,
            stepId,
            errorMessage,
            maxRetries,
            nextRetryAt: new Date(Date.now() + 60000)
        });
        await this.retryQueueRepository.save(retryItem);
    }
    async processRetryQueue() {
        const retryItems = await this.retryQueueRepository.find({
            where: {
                nextRetryAt: (0, typeorm_2.LessThanOrEqual)(new Date())
            }
        });
        for (const item of retryItems) {
            if (item.retryCount >= item.maxRetries) {
                await this.retryQueueRepository.delete(item.id);
                continue;
            }
            item.retryCount += 1;
            item.nextRetryAt = new Date(Date.now() + Math.pow(2, item.retryCount) * 60000);
            await this.retryQueueRepository.save(item);
            await this.workflowsQueue.add('retry-step', {
                runId: item.runId,
                stepId: item.stepId
            });
        }
    }
};
exports.EngineService = EngineService;
exports.EngineService = EngineService = EngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Execution)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.ExecutionStep)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Workflow)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.WorkflowVersion)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_2.SystemEvent)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_2.IdempotencyKey)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_2.DistributedLock)),
    __param(7, (0, typeorm_1.InjectRepository)(entities_2.RetryQueue)),
    __param(8, (0, bull_1.InjectQueue)('events')),
    __param(9, (0, bull_1.InjectQueue)('workflows')),
    __param(10, (0, bull_1.InjectQueue)('human-tasks')),
    __param(11, (0, bull_1.InjectQueue)('evidence')),
    __param(12, (0, bull_1.InjectQueue)('usage')),
    __param(13, (0, bull_1.InjectQueue)('audit')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object, Object, Object, Object, Object, Object, event_processor_1.EventProcessor,
        human_task_processor_1.HumanTaskProcessor,
        evidence_processor_1.EvidenceProcessor,
        usage_processor_1.UsageProcessor,
        audit_processor_1.AuditProcessor])
], EngineService);
//# sourceMappingURL=engine.service.js.map