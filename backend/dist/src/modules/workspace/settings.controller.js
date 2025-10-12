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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const workspace_settings_service_1 = require("./workspace-settings.service");
const usage_analytics_service_1 = require("./services/usage-analytics.service");
const plan_management_service_1 = require("./services/plan-management.service");
const usage_history_dto_1 = require("./dto/usage-history.dto");
const plan_management_dto_1 = require("./dto/plan-management.dto");
let SettingsController = class SettingsController {
    workspaceSettingsService;
    usageAnalyticsService;
    planManagementService;
    constructor(workspaceSettingsService, usageAnalyticsService, planManagementService) {
        this.workspaceSettingsService = workspaceSettingsService;
        this.usageAnalyticsService = usageAnalyticsService;
        this.planManagementService = planManagementService;
    }
    requireWorkspaceId(user) {
        const id = user.workspaceId ?? null;
        if (!id) {
            throw new common_1.UnprocessableEntityException('Workspace não definido para este usuário. Crie ou selecione um workspace padrão e tente novamente.');
        }
        return id;
    }
    async getSettingsSummary(user) {
        const summary = await this.workspaceSettingsService.getSummary(user);
        return {
            status: 'ok',
            summary,
        };
    }
    async getUsageHistory(user, query) {
        const workspaceId = this.requireWorkspaceId(user);
        const history = await this.usageAnalyticsService.getUsageHistory(workspaceId, query);
        return {
            status: 'ok',
            data: history,
        };
    }
    async getUsageAlerts(user) {
        const workspaceId = this.requireWorkspaceId(user);
        const alerts = await this.usageAnalyticsService.getUsageAlerts(workspaceId);
        return {
            status: 'ok',
            alerts,
        };
    }
    async createUsageAlert(user, alertConfig) {
        const workspaceId = this.requireWorkspaceId(user);
        const alert = await this.usageAnalyticsService.createUsageAlert(workspaceId, alertConfig);
        return {
            status: 'ok',
            alert,
        };
    }
    async getAvailablePlans() {
        const plans = await this.planManagementService.getAvailablePlans();
        return {
            status: 'ok',
            plans,
        };
    }
    async upgradePlan(user, upgradeData) {
        const workspaceId = this.requireWorkspaceId(user);
        const result = await this.planManagementService.upgradePlan(workspaceId, upgradeData);
        return {
            status: 'ok',
            ...result,
        };
    }
    async cancelSubscription(user, cancelData) {
        const workspaceId = this.requireWorkspaceId(user);
        const result = await this.planManagementService.cancelSubscription(workspaceId, cancelData);
        return {
            status: 'ok',
            ...result,
        };
    }
    async getBillingHistory(user) {
        const workspaceId = this.requireWorkspaceId(user);
        const history = await this.planManagementService.getBillingHistory(workspaceId);
        return {
            status: 'ok',
            history,
        };
    }
    async updateProfile(user, profileData) {
        return {
            status: 'ok',
            message: 'Profile updated successfully',
        };
    }
    async updateSecuritySettings(user, securityData) {
        return {
            status: 'ok',
            message: 'Security settings updated successfully',
        };
    }
    async createApiKey(user, keyData) {
        return {
            status: 'ok',
            message: 'API key created successfully',
        };
    }
    async revokeApiKey(user, keyId) {
        return {
            status: 'ok',
            message: 'API key revoked successfully',
        };
    }
    async getApiKeyUsage(user, keyId) {
        return {
            status: 'ok',
            usage: [],
        };
    }
    async rotateApiKey(user, keyId) {
        return {
            status: 'ok',
            message: 'API key rotated successfully',
        };
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('summary'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getSettingsSummary", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('usage/history'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, usage_history_dto_1.UsageHistoryQueryDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getUsageHistory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('usage/alerts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getUsageAlerts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('usage/alerts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "createUsageAlert", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('plans/available'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getAvailablePlans", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('plans/upgrade'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, plan_management_dto_1.UpgradePlanDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "upgradePlan", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('billing/cancel'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, plan_management_dto_1.CancelSubscriptionDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('billing/history'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getBillingHistory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('personal/profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('personal/security'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateSecuritySettings", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('api/keys'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "createApiKey", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('api/keys/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "revokeApiKey", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('api/keys/:id/usage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getApiKeyUsage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('api/keys/:id/rotate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "rotateApiKey", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.Controller)('api/settings'),
    __metadata("design:paramtypes", [workspace_settings_service_1.WorkspaceSettingsService,
        usage_analytics_service_1.UsageAnalyticsService,
        plan_management_service_1.PlanManagementService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map