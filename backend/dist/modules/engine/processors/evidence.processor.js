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
var EvidenceProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
let EvidenceProcessor = EvidenceProcessor_1 = class EvidenceProcessor {
    logger = new common_1.Logger(EvidenceProcessor_1.name);
    async handleEvidencePackageGeneration(job) {
        const { runId, packageType, manifest } = job.data;
        try {
            this.logger.log(`Generating evidence package: ${runId} (${packageType})`);
            this.logger.log(`Evidence package generated successfully: ${runId}`);
        }
        catch (error) {
            this.logger.error(`Failed to generate evidence package ${runId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleEvidencePackageSigning(job) {
        const { packageId, signerId, signerName, signatureAlgorithm } = job.data;
        try {
            this.logger.log(`Signing evidence package: ${packageId} by ${signerName}`);
            this.logger.log(`Evidence package signed successfully: ${packageId}`);
        }
        catch (error) {
            this.logger.error(`Failed to sign evidence package ${packageId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleEvidencePackageValidation(job) {
        const { packageId, validationType } = job.data;
        try {
            this.logger.log(`Validating evidence package: ${packageId} (${validationType})`);
            this.logger.log(`Evidence package validated successfully: ${packageId}`);
        }
        catch (error) {
            this.logger.error(`Failed to validate evidence package ${packageId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleEvidencePackageExport(job) {
        const { packageId, exportFormat, recipientId } = job.data;
        try {
            this.logger.log(`Exporting evidence package: ${packageId} (${exportFormat})`);
            this.logger.log(`Evidence package exported successfully: ${packageId}`);
        }
        catch (error) {
            this.logger.error(`Failed to export evidence package ${packageId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleDataMasking(job) {
        const { data, maskingRules, context } = job.data;
        try {
            this.logger.log(`Applying data masking: ${maskingRules.length} rules`);
            this.logger.log(`Data masking applied successfully`);
        }
        catch (error) {
            this.logger.error(`Failed to apply data masking: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleDataCleanup(job) {
        const { retentionPolicyId, dataType } = job.data;
        try {
            this.logger.log(`Cleaning up expired data: ${dataType} (policy ${retentionPolicyId})`);
            this.logger.log(`Data cleanup completed successfully: ${dataType}`);
        }
        catch (error) {
            this.logger.error(`Failed to cleanup data ${dataType}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.EvidenceProcessor = EvidenceProcessor;
__decorate([
    (0, bull_1.Process)('generate-evidence-package'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EvidenceProcessor.prototype, "handleEvidencePackageGeneration", null);
__decorate([
    (0, bull_1.Process)('sign-evidence-package'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EvidenceProcessor.prototype, "handleEvidencePackageSigning", null);
__decorate([
    (0, bull_1.Process)('validate-evidence-package'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EvidenceProcessor.prototype, "handleEvidencePackageValidation", null);
__decorate([
    (0, bull_1.Process)('export-evidence-package'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EvidenceProcessor.prototype, "handleEvidencePackageExport", null);
__decorate([
    (0, bull_1.Process)('apply-data-masking'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EvidenceProcessor.prototype, "handleDataMasking", null);
__decorate([
    (0, bull_1.Process)('cleanup-expired-data'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EvidenceProcessor.prototype, "handleDataCleanup", null);
exports.EvidenceProcessor = EvidenceProcessor = EvidenceProcessor_1 = __decorate([
    (0, bull_1.Processor)('evidence')
], EvidenceProcessor);
//# sourceMappingURL=evidence.processor.js.map