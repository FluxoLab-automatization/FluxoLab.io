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
var EventProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
let EventProcessor = EventProcessor_1 = class EventProcessor {
    logger = new common_1.Logger(EventProcessor_1.name);
    async handleEventProcessing(job) {
        const { eventId, eventType, payload } = job.data;
        try {
            this.logger.log(`Processing event: ${eventType} (${eventId})`);
            switch (eventType) {
                case 'flx.webhook.received':
                    await this.handleWebhookReceived(payload);
                    break;
                case 'flx.run.started':
                    await this.handleRunStarted(payload);
                    break;
                case 'flx.run.running':
                    await this.handleRunRunning(payload);
                    break;
                case 'flx.run.succeeded':
                    await this.handleRunSucceeded(payload);
                    break;
                case 'flx.run.failed':
                    await this.handleRunFailed(payload);
                    break;
                case 'flx.step.started':
                    await this.handleStepStarted(payload);
                    break;
                case 'flx.step.succeeded':
                    await this.handleStepSucceeded(payload);
                    break;
                case 'flx.step.failed':
                    await this.handleStepFailed(payload);
                    break;
                case 'flx.human_task.created':
                    await this.handleHumanTaskCreated(payload);
                    break;
                case 'flx.human_task.resolved':
                    await this.handleHumanTaskResolved(payload);
                    break;
                case 'flx.evidence.packaged':
                    await this.handleEvidencePackaged(payload);
                    break;
                case 'flx.usage.incremented':
                    await this.handleUsageIncremented(payload);
                    break;
                case 'flx.alert.raised':
                    await this.handleAlertRaised(payload);
                    break;
                default:
                    this.logger.warn(`Unknown event type: ${eventType}`);
            }
            this.logger.log(`Event processed successfully: ${eventType} (${eventId})`);
        }
        catch (error) {
            this.logger.error(`Failed to process event ${eventType}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleWebhookReceived(payload) {
        this.logger.log(`Webhook received: ${payload.webhookId}`);
    }
    async handleRunStarted(payload) {
        this.logger.log(`Run started: ${payload.runId}`);
    }
    async handleRunRunning(payload) {
        this.logger.log(`Run running: ${payload.runId}`);
    }
    async handleRunSucceeded(payload) {
        this.logger.log(`Run succeeded: ${payload.runId}`);
    }
    async handleRunFailed(payload) {
        this.logger.log(`Run failed: ${payload.runId} - ${payload.error}`);
    }
    async handleStepStarted(payload) {
        this.logger.log(`Step started: ${payload.stepId} (${payload.nodeType})`);
    }
    async handleStepSucceeded(payload) {
        this.logger.log(`Step succeeded: ${payload.stepId} (${payload.nodeType})`);
    }
    async handleStepFailed(payload) {
        this.logger.log(`Step failed: ${payload.stepId} (${payload.nodeType}) - ${payload.error}`);
    }
    async handleHumanTaskCreated(payload) {
        this.logger.log(`Human task created: ${payload.taskId}`);
    }
    async handleHumanTaskResolved(payload) {
        this.logger.log(`Human task resolved: ${payload.taskId}`);
    }
    async handleEvidencePackaged(payload) {
        this.logger.log(`Evidence packaged: ${payload.packageId}`);
    }
    async handleUsageIncremented(payload) {
        this.logger.log(`Usage incremented: ${payload.counterType} - ${payload.incrementValue}`);
    }
    async handleAlertRaised(payload) {
        this.logger.log(`Alert raised: ${payload.alertId} - ${payload.alertType}`);
    }
};
exports.EventProcessor = EventProcessor;
__decorate([
    (0, bull_1.Process)('process-event'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventProcessor.prototype, "handleEventProcessing", null);
exports.EventProcessor = EventProcessor = EventProcessor_1 = __decorate([
    (0, bull_1.Processor)('events')
], EventProcessor);
//# sourceMappingURL=event.processor.js.map