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
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const require_workspace_guard_1 = require("../auth/require-workspace.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const webhooks_service_1 = require("./webhooks.service");
let WebhooksController = class WebhooksController {
    webhooksService;
    constructor(webhooksService) {
        this.webhooksService = webhooksService;
    }
    async createWebhook(user, webhookData) {
        const workspaceId = user.workspaceId;
        const webhook = await this.webhooksService.createWebhook(workspaceId, {
            ...webhookData,
            createdBy: user.id,
        });
        return {
            status: 'ok',
            webhook,
        };
    }
    async listWebhooks(user, limit, offset) {
        const workspaceId = user.workspaceId;
        const webhooks = await this.webhooksService.listWebhooks(workspaceId, {
            limit: limit ? parseInt(limit, 10) : 50,
            offset: offset ? parseInt(offset, 10) : 0,
        });
        return {
            status: 'ok',
            webhooks,
        };
    }
    async getWebhook(user, webhookId) {
        const workspaceId = user.workspaceId;
        const webhook = await this.webhooksService.getWebhook(workspaceId, webhookId);
        return {
            status: 'ok',
            webhook,
        };
    }
    async updateWebhook(user, webhookId, webhookData) {
        const workspaceId = user.workspaceId;
        const webhook = await this.webhooksService.updateWebhook(workspaceId, webhookId, webhookData);
        return {
            status: 'ok',
            webhook,
        };
    }
    async deleteWebhook(user, webhookId) {
        const workspaceId = user.workspaceId;
        await this.webhooksService.deleteWebhook(workspaceId, webhookId);
        return {
            status: 'ok',
            message: 'Webhook deleted successfully',
        };
    }
    async testWebhook(user, webhookId, testData) {
        const workspaceId = user.workspaceId;
        const result = await this.webhooksService.testWebhook(workspaceId, webhookId, testData);
        return {
            status: 'ok',
            result,
        };
    }
    async getWebhookLogs(user, webhookId, limit, offset) {
        const workspaceId = user.workspaceId;
        const logs = await this.webhooksService.getWebhookLogs(workspaceId, webhookId, {
            limit: limit ? parseInt(limit, 10) : 50,
            offset: offset ? parseInt(offset, 10) : 0,
        });
        return {
            status: 'ok',
            logs,
        };
    }
    async executeWebhook(token, payload, query) {
        const result = await this.webhooksService.executeWebhook(token, {
            payload,
            query,
            headers: {},
            method: 'POST',
        });
        return result;
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "createWebhook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "listWebhooks", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Get)(':webhookId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('webhookId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "getWebhook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Put)(':webhookId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('webhookId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "updateWebhook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Delete)(':webhookId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('webhookId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "deleteWebhook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Post)(':webhookId/test'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('webhookId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "testWebhook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Get)(':webhookId/logs'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('webhookId')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "getWebhookLogs", null);
__decorate([
    (0, common_1.Post)('execute/:token'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "executeWebhook", null);
exports.WebhooksController = WebhooksController = __decorate([
    (0, common_1.Controller)('api/webhooks'),
    __metadata("design:paramtypes", [webhooks_service_1.WebhooksService])
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map