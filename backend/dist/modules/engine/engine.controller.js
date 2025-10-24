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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../shared/guards/jwt-auth.guard");
const engine_service_1 = require("./engine.service");
const dto_1 = require("./dto");
let EngineController = class EngineController {
    engineService;
    constructor(engineService) {
        this.engineService = engineService;
    }
    async startWorkflow(workflowId, startWorkflowDto) {
        const runId = await this.engineService.startWorkflowExecution(workflowId, startWorkflowDto.triggerData, {
            tenantId: startWorkflowDto.tenantId,
            workspaceId: startWorkflowDto.workspaceId,
            userId: startWorkflowDto.userId,
            correlationId: startWorkflowDto.correlationId,
            traceId: startWorkflowDto.traceId
        });
        return { runId, status: 'started' };
    }
    async processNode(processNodeDto) {
        const result = await this.engineService.processNode(processNodeDto.runId, processNodeDto.nodeId, processNodeDto.nodeData, processNodeDto.inputData, processNodeDto.context);
        return { result };
    }
    async createHumanTask(createHumanTaskDto) {
        return { message: 'Human task created successfully' };
    }
    async processHumanTask(taskId, processHumanTaskDto) {
        return { message: 'Human task processed successfully' };
    }
    async getEvents(eventType, workspaceId, runId, limit = 50, offset = 0) {
        return { events: [], total: 0 };
    }
    async getExecutionStatus(runId) {
        return { runId, status: 'running' };
    }
    async getExecutionEvidence(runId) {
        return { runId, evidence: {} };
    }
    async retryStep(runId, stepId) {
        await this.engineService.addToRetryQueue(runId, stepId, 'Manual retry');
        return { message: 'Step added to retry queue' };
    }
    async acquireLock(body) {
        const acquired = await this.engineService.acquireLock(body.lockKey, body.lockedBy, body.ttlSeconds);
        return { acquired };
    }
    async releaseLock(body) {
        await this.engineService.releaseLock(body.lockKey, body.lockedBy);
        return { message: 'Lock released' };
    }
    async getHealth() {
        return { status: 'healthy', timestamp: new Date().toISOString() };
    }
};
exports.EngineController = EngineController;
__decorate([
    (0, common_1.Post)('workflows/:workflowId/start'),
    __param(0, (0, common_1.Param)('workflowId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.StartWorkflowDto]),
    __metadata("design:returntype", Promise)
], EngineController.prototype, "startWorkflow", null);
__decorate([
    (0, common_1.Post)('nodes/process'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ProcessNodeDto]),
    __metadata("design:returntype", Promise)
], EngineController.prototype, "processNode", null);
__decorate([
    (0, common_1.Post)('human-tasks'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateHumanTaskDto]),
    __metadata("design:returntype", Promise)
], EngineController.prototype, "createHumanTask", null);
__decorate([
    (0, common_1.Post)('human-tasks/:taskId/process'),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ProcessHumanTaskDto]),
    __metadata("design:returntype", Promise)
], EngineController.prototype, "processHumanTask", null);
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, common_1.Query)('eventType')),
    __param(1, (0, common_1.Query)('workspaceId')),
    __param(2, (0, common_1.Query)('runId')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], EngineController.prototype, "getEvents", null);
__decorate([
    (0, common_1.Get)('executions/:runId/status'),
    __param(0, (0, common_1.Param)('runId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EngineController.prototype, "getExecutionStatus", null);
__decorate([
    (0, common_1.Get)('executions/:runId/evidence'),
    __param(0, (0, common_1.Param)('runId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EngineController.prototype, "getExecutionEvidence", null);
__decorate([
    (0, common_1.Post)('retry/:runId/:stepId'),
    __param(0, (0, common_1.Param)('runId')),
    __param(1, (0, common_1.Param)('stepId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EngineController.prototype, "retryStep", null);
__decorate([
    (0, common_1.Post)('locks/acquire'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EngineController.prototype, "acquireLock", null);
__decorate([
    (0, common_1.Post)('locks/release'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EngineController.prototype, "releaseLock", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EngineController.prototype, "getHealth", null);
exports.EngineController = EngineController = __decorate([
    (0, common_1.Controller)('api/engine'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [engine_service_1.EngineService])
], EngineController);
//# sourceMappingURL=engine.controller.js.map