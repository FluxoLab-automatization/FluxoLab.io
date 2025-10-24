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
var WorkflowProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const engine_service_1 = require("../engine.service");
let WorkflowProcessor = WorkflowProcessor_1 = class WorkflowProcessor {
    engineService;
    logger = new common_1.Logger(WorkflowProcessor_1.name);
    constructor(engineService) {
        this.engineService = engineService;
    }
    async handleWorkflowProcessing(job) {
        const { runId, workflowId, versionId, triggerData, context } = job.data;
        try {
            this.logger.log(`Processing workflow: ${workflowId} (${runId})`);
            await this.engineService.processWorkflowExecution(runId, workflowId, versionId, triggerData, context);
            this.logger.log(`Workflow processed successfully: ${workflowId} (${runId})`);
        }
        catch (error) {
            this.logger.error(`Failed to process workflow ${workflowId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleStepRetry(job) {
        const { runId, stepId } = job.data;
        try {
            this.logger.log(`Retrying step: ${stepId} (${runId})`);
            this.logger.log(`Step retry completed: ${stepId} (${runId})`);
        }
        catch (error) {
            this.logger.error(`Failed to retry step ${stepId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleWorkflowNodesProcessing(job) {
        const { runId, version, triggerData, context } = job.data;
        try {
            this.logger.log(`Processing workflow nodes: ${runId}`);
            this.logger.log(`Workflow nodes processed successfully: ${runId}`);
        }
        catch (error) {
            this.logger.error(`Failed to process workflow nodes ${runId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async processWorkflowNodes(runId, version, triggerData, context) {
        try {
            this.logger.log(`Processing workflow nodes: ${runId}`);
            if (version.nodes && Array.isArray(version.nodes)) {
                for (const node of version.nodes) {
                    await this.engineService.processNode(runId, node.id, node, triggerData, context);
                }
            }
            this.logger.log(`Workflow nodes processed successfully: ${runId}`);
        }
        catch (error) {
            this.logger.error(`Failed to process workflow nodes ${runId}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.WorkflowProcessor = WorkflowProcessor;
__decorate([
    (0, bull_1.Process)('process-workflow'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkflowProcessor.prototype, "handleWorkflowProcessing", null);
__decorate([
    (0, bull_1.Process)('retry-step'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkflowProcessor.prototype, "handleStepRetry", null);
__decorate([
    (0, bull_1.Process)('process-workflow-nodes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkflowProcessor.prototype, "handleWorkflowNodesProcessing", null);
exports.WorkflowProcessor = WorkflowProcessor = WorkflowProcessor_1 = __decorate([
    (0, bull_1.Processor)('workflows'),
    __metadata("design:paramtypes", [engine_service_1.EngineService])
], WorkflowProcessor);
//# sourceMappingURL=workflow.processor.js.map