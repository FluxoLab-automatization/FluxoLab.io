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
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const generate_webhook_dto_1 = require("./dto/generate-webhook.dto");
const webhooks_service_1 = require("./webhooks.service");
let WebhooksController = class WebhooksController {
    webhooksService;
    constructor(webhooksService) {
        this.webhooksService = webhooksService;
    }
    generateWebhook(payload) {
        return this.webhooksService.generateWebhook(payload);
    }
    async verifyWebhook(token, query, headers, res) {
        const challenge = await this.webhooksService.verifyWebhook(token, query, headers);
        res.status(200).send(challenge);
    }
    receiveWebhook(token, body, headers, req) {
        return this.webhooksService.receiveWebhook(token, body, headers, req.rawBody);
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, common_1.Post)('generate-webhook'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_webhook_dto_1.GenerateWebhookDto]),
    __metadata("design:returntype", void 0)
], WebhooksController.prototype, "generateWebhook", null);
__decorate([
    (0, common_1.Get)('webhooks/:token'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Headers)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "verifyWebhook", null);
__decorate([
    (0, common_1.Post)('webhooks/:token'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], WebhooksController.prototype, "receiveWebhook", null);
exports.WebhooksController = WebhooksController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [webhooks_service_1.WebhooksService])
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map