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
var UsageProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
let UsageProcessor = UsageProcessor_1 = class UsageProcessor {
    logger = new common_1.Logger(UsageProcessor_1.name);
    async handleUsageIncrement(job) {
        const { workspaceId, counterType, resourceId, resourceName, incrementValue } = job.data;
        try {
            this.logger.log(`Incrementing usage counter: ${counterType} +${incrementValue}`);
            this.logger.log(`Usage counter incremented successfully: ${counterType}`);
        }
        catch (error) {
            this.logger.error(`Failed to increment usage counter ${counterType}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleQuotaLimitCheck(job) {
        const { workspaceId, quotaType } = job.data;
        try {
            this.logger.log(`Checking quota limits: ${quotaType} for workspace ${workspaceId}`);
            this.logger.log(`Quota limits checked successfully: ${quotaType}`);
        }
        catch (error) {
            this.logger.error(`Failed to check quota limits ${quotaType}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleUsageReportGeneration(job) {
        const { workspaceId, reportType, periodStart, periodEnd, generatedBy } = job.data;
        try {
            this.logger.log(`Generating usage report: ${reportType} for workspace ${workspaceId}`);
            this.logger.log(`Usage report generated successfully: ${reportType}`);
        }
        catch (error) {
            this.logger.error(`Failed to generate usage report ${reportType}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleInvoiceGeneration(job) {
        const { workspaceId, subscriptionId, periodStart, periodEnd } = job.data;
        try {
            this.logger.log(`Generating invoice for workspace ${workspaceId}`);
            this.logger.log(`Invoice generated successfully for workspace ${workspaceId}`);
        }
        catch (error) {
            this.logger.error(`Failed to generate invoice for workspace ${workspaceId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handlePaymentProcessing(job) {
        const { invoiceId, paymentMethod, amount, currency, externalPaymentId } = job.data;
        try {
            this.logger.log(`Processing payment for invoice ${invoiceId}`);
            this.logger.log(`Payment processed successfully for invoice ${invoiceId}`);
        }
        catch (error) {
            this.logger.error(`Failed to process payment for invoice ${invoiceId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleQuotaCounterReset(job) {
        const { workspaceId, resetPeriod } = job.data;
        try {
            this.logger.log(`Resetting quota counters for workspace ${workspaceId}`);
            this.logger.log(`Quota counters reset successfully for workspace ${workspaceId}`);
        }
        catch (error) {
            this.logger.error(`Failed to reset quota counters for workspace ${workspaceId}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UsageProcessor = UsageProcessor;
__decorate([
    (0, bull_1.Process)('increment-usage-counter'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsageProcessor.prototype, "handleUsageIncrement", null);
__decorate([
    (0, bull_1.Process)('check-quota-limits'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsageProcessor.prototype, "handleQuotaLimitCheck", null);
__decorate([
    (0, bull_1.Process)('generate-usage-report'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsageProcessor.prototype, "handleUsageReportGeneration", null);
__decorate([
    (0, bull_1.Process)('generate-invoice'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsageProcessor.prototype, "handleInvoiceGeneration", null);
__decorate([
    (0, bull_1.Process)('process-payment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsageProcessor.prototype, "handlePaymentProcessing", null);
__decorate([
    (0, bull_1.Process)('reset-quota-counters'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsageProcessor.prototype, "handleQuotaCounterReset", null);
exports.UsageProcessor = UsageProcessor = UsageProcessor_1 = __decorate([
    (0, bull_1.Processor)('usage')
], UsageProcessor);
//# sourceMappingURL=usage.processor.js.map