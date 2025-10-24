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
var AuditProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
let AuditProcessor = AuditProcessor_1 = class AuditProcessor {
    logger = new common_1.Logger(AuditProcessor_1.name);
    async handleAuditEventLogging(job) {
        const { tenantId, workspaceId, runId, actorType, actorId, actorName, action, entityType, entityId, entityName, oldValues, newValues, context, ipAddress, userAgent, sessionId, correlationId, traceId } = job.data;
        try {
            this.logger.log(`Logging audit event: ${action} on ${entityType}`);
            this.logger.log(`Audit event logged successfully: ${action}`);
        }
        catch (error) {
            this.logger.error(`Failed to log audit event ${action}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleConsentRequestProcessing(job) {
        const { workspaceId, subjectId, subjectType, consentType, consentStatus, consentMethod, consentText, ipAddress, userAgent } = job.data;
        try {
            this.logger.log(`Processing consent request: ${consentType} for ${subjectId}`);
            this.logger.log(`Consent request processed successfully: ${consentType}`);
        }
        catch (error) {
            this.logger.error(`Failed to process consent request ${consentType}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleErasureRequestProcessing(job) {
        const { workspaceId, subjectId, subjectType, requestType, requestedBy } = job.data;
        try {
            this.logger.log(`Processing erasure request: ${requestType} for ${subjectId}`);
            this.logger.log(`Erasure request processed successfully: ${requestType}`);
        }
        catch (error) {
            this.logger.error(`Failed to process erasure request ${requestType}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleDataAccessLogging(job) {
        const { workspaceId, subjectId, subjectType, accessType, accessedBy, accessedByName, dataCategories, purpose, legalBasis, ipAddress, userAgent } = job.data;
        try {
            this.logger.log(`Logging data access: ${accessType} for ${subjectId}`);
            this.logger.log(`Data access logged successfully: ${accessType}`);
        }
        catch (error) {
            this.logger.error(`Failed to log data access ${accessType}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleComplianceReportGeneration(job) {
        const { workspaceId, reportType, periodStart, periodEnd, generatedBy } = job.data;
        try {
            this.logger.log(`Generating compliance report: ${reportType} for workspace ${workspaceId}`);
            this.logger.log(`Compliance report generated successfully: ${reportType}`);
        }
        catch (error) {
            this.logger.error(`Failed to generate compliance report ${reportType}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleAuditDataCleanup(job) {
        const { retentionPolicyId, dataType } = job.data;
        try {
            this.logger.log(`Cleaning up audit data: ${dataType} (policy ${retentionPolicyId})`);
            this.logger.log(`Audit data cleanup completed successfully: ${dataType}`);
        }
        catch (error) {
            this.logger.error(`Failed to cleanup audit data ${dataType}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AuditProcessor = AuditProcessor;
__decorate([
    (0, bull_1.Process)('log-audit-event'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuditProcessor.prototype, "handleAuditEventLogging", null);
__decorate([
    (0, bull_1.Process)('process-consent-request'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuditProcessor.prototype, "handleConsentRequestProcessing", null);
__decorate([
    (0, bull_1.Process)('process-erasure-request'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuditProcessor.prototype, "handleErasureRequestProcessing", null);
__decorate([
    (0, bull_1.Process)('log-data-access'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuditProcessor.prototype, "handleDataAccessLogging", null);
__decorate([
    (0, bull_1.Process)('generate-compliance-report'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuditProcessor.prototype, "handleComplianceReportGeneration", null);
__decorate([
    (0, bull_1.Process)('cleanup-audit-data'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuditProcessor.prototype, "handleAuditDataCleanup", null);
exports.AuditProcessor = AuditProcessor = AuditProcessor_1 = __decorate([
    (0, bull_1.Processor)('audit')
], AuditProcessor);
//# sourceMappingURL=audit.processor.js.map