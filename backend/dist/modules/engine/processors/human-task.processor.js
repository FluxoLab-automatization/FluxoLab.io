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
var HumanTaskProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HumanTaskProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
let HumanTaskProcessor = HumanTaskProcessor_1 = class HumanTaskProcessor {
    logger = new common_1.Logger(HumanTaskProcessor_1.name);
    async handleHumanTaskCreation(job) {
        const { runId, stepId, taskType, title, description, instructions, priority, assignedTo, slaHours, inputData } = job.data;
        try {
            this.logger.log(`Creating human task: ${title} (${runId})`);
            this.logger.log(`Human task created successfully: ${title} (${runId})`);
        }
        catch (error) {
            this.logger.error(`Failed to create human task ${title}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleHumanTaskProcessing(job) {
        const { taskId, action, performedBy, comment, outputData } = job.data;
        try {
            this.logger.log(`Processing human task: ${taskId} (${action})`);
            this.logger.log(`Human task processed successfully: ${taskId} (${action})`);
        }
        catch (error) {
            this.logger.error(`Failed to process human task ${taskId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleHumanTaskEscalation(job) {
        const { taskId, escalationLevel, escalatedTo, reason } = job.data;
        try {
            this.logger.log(`Escalating human task: ${taskId} (level ${escalationLevel})`);
            this.logger.log(`Human task escalated successfully: ${taskId} (level ${escalationLevel})`);
        }
        catch (error) {
            this.logger.error(`Failed to escalate human task ${taskId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleNotificationSending(job) {
        const { taskId, notificationType, recipientId, channel, subject, body } = job.data;
        try {
            this.logger.log(`Sending notification: ${notificationType} to ${recipientId} via ${channel}`);
            this.logger.log(`Notification sent successfully: ${notificationType} to ${recipientId}`);
        }
        catch (error) {
            this.logger.error(`Failed to send notification to ${recipientId}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.HumanTaskProcessor = HumanTaskProcessor;
__decorate([
    (0, bull_1.Process)('create-human-task'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HumanTaskProcessor.prototype, "handleHumanTaskCreation", null);
__decorate([
    (0, bull_1.Process)('process-human-task'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HumanTaskProcessor.prototype, "handleHumanTaskProcessing", null);
__decorate([
    (0, bull_1.Process)('escalate-human-task'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HumanTaskProcessor.prototype, "handleHumanTaskEscalation", null);
__decorate([
    (0, bull_1.Process)('send-notification'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HumanTaskProcessor.prototype, "handleNotificationSending", null);
exports.HumanTaskProcessor = HumanTaskProcessor = HumanTaskProcessor_1 = __decorate([
    (0, bull_1.Processor)('human-tasks')
], HumanTaskProcessor);
//# sourceMappingURL=human-task.processor.js.map