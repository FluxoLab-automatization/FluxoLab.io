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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowsProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const config_1 = require("@nestjs/config");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
let WorkflowsProcessor = class WorkflowsProcessor {
    whatsappService;
    config;
    constructor(whatsappService, config) {
        this.whatsappService = whatsappService;
        this.config = config;
    }
    async handleLeadCaptured(job) {
        console.log('--- Workflow Processor ---');
        console.log('Processing job:', job.id);
        console.log('Job Name:', job.name);
        console.log('Lead Payload:', JSON.stringify(job.data.payload, null, 2));
        const payloadPhone = job.data.payload?.phone;
        const fallbackPhone = this.config.get('WHATSAPP_LEAD_ALERT_PHONE', { infer: true }) ?? null;
        const targetPhone = this.normalizePhone(payloadPhone ?? fallbackPhone);
        if (targetPhone) {
            const leadName = job.data.payload?.name || 'N/A';
            const message = `Ola! Recebemos seu contato. Em breve um de nossos especialistas falara com voce. Lead: ${leadName}`;
            await this.whatsappService.sendMessage(targetPhone, message);
        }
        else {
            console.warn('Lead captured job does not contain a valid phone and no fallback was configured.');
        }
        console.log('--- End of Job ---');
    }
    normalizePhone(value) {
        if (!value) {
            return null;
        }
        const digits = value.replace(/\D+/g, '');
        if (digits.length < 10) {
            return null;
        }
        return digits;
    }
};
exports.WorkflowsProcessor = WorkflowsProcessor;
__decorate([
    (0, bull_1.Process)('lead.captured'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkflowsProcessor.prototype, "handleLeadCaptured", null);
exports.WorkflowsProcessor = WorkflowsProcessor = __decorate([
    (0, bull_1.Processor)('workflows'),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService,
        config_1.ConfigService])
], WorkflowsProcessor);
//# sourceMappingURL=workflows.processor.js.map