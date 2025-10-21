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
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
let WorkflowsProcessor = class WorkflowsProcessor {
    whatsappService;
    constructor(whatsappService) {
        this.whatsappService = whatsappService;
    }
    async handleLeadCaptured(job) {
        console.log('--- Workflow Processor ---');
        console.log('Processing job:', job.id);
        console.log('Job Name:', job.name);
        console.log('Lead Payload:', JSON.stringify(job.data.payload, null, 2));
        const phone = job.data.payload?.phone;
        if (phone) {
            const message = `Olá! Recebemos seu contato. Em breve um de nossos especialistas falará com você. Lead: ${job.data.payload?.name || 'N/A'}`;
            await this.whatsappService.sendMessage('553199999-9999', message);
        }
        else {
            console.warn('Job payload does not contain a phone number. Cannot send WhatsApp message.');
        }
        console.log('--- End of Job ---');
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
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService])
], WorkflowsProcessor);
//# sourceMappingURL=workflows.processor.js.map