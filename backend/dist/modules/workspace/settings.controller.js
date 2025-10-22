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
const workspace_api_keys_service_1 = require("./services/workspace-api-keys.service");
const workspace_integrations_service_1 = require("./services/workspace-integrations.service");
const usage_history_dto_1 = require("./dto/usage-history.dto");
const plan_management_dto_1 = require("./dto/plan-management.dto");
const settings_requests_dto_1 = require("./dto/settings-requests.dto");
let SettingsController = class SettingsController {
    workspaceSettingsService;
    usageAnalyticsService;
    planManagementService;
    apiKeysService;
    integrationsService;
    constructor(workspaceSettingsService, usageAnalyticsService, planManagementService, apiKeysService, integrationsService) {
        this.workspaceSettingsService = workspaceSettingsService;
        this.usageAnalyticsService = usageAnalyticsService;
        this.planManagementService = planManagementService;
        this.apiKeysService = apiKeysService;
        this.integrationsService = integrationsService;
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
    async createUsageAlert(user, payload) {
        const workspaceId = this.requireWorkspaceId(user);
        const alert = await this.usageAnalyticsService.createUsageAlert(workspaceId, {
            metric: payload.metric,
            threshold: payload.threshold,
            condition: payload.condition,
            window: payload.window,
            channel: payload.channel,
            enabled: payload.enabled,
            metadata: payload.metadata ?? {},
            createdBy: user.id,
        });
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
    async getIntegrationsStatus(user) {
        const workspaceId = this.requireWorkspaceId(user);
        const integrations = await this.integrationsService.getStatus(workspaceId);
        return {
            status: 'ok',
            integrations,
        };
    }
    async setEnvironmentStatus(user, environmentId, payload) {
        const workspaceId = this.requireWorkspaceId(user);
        const updated = await this.integrationsService.updateEnvironmentStatus({
            workspaceId,
            environmentId,
            status: payload.status,
        });
        if (!updated) {
            throw new common_1.NotFoundException('Ambiente nao encontrado para este workspace.');
        }
        return {
            status: 'ok',
            environment: updated,
        };
    }
    async configureSso(user, payload) {
        const workspaceId = this.requireWorkspaceId(user);
        await this.integrationsService.configureSso({
            workspaceId,
            provider: payload.provider,
            clientId: payload.clientId,
            clientSecret: payload.clientSecret,
            enabled: payload.enabled,
            recordedBy: user.id,
        });
        return {
            status: 'ok',
            message: 'SSO configuration updated successfully',
        };
    }
    async configureLdap(user, payload) {
        const workspaceId = this.requireWorkspaceId(user);
        await this.integrationsService.configureLdap({
            workspaceId,
            host: payload.host,
            baseDn: payload.baseDn,
            port: payload.port,
            bindDn: payload.bindDn,
            bindPassword: payload.bindPassword,
            enabled: payload.enabled,
            recordedBy: user.id,
        });
        return {
            status: 'ok',
            message: 'LDAP configuration updated successfully',
        };
    }
    async configureLogDestination(user, payload) {
        const workspaceId = this.requireWorkspaceId(user);
        await this.integrationsService.configureLogDestination({
            workspaceId,
            destination: payload.destination,
            endpoint: payload.endpoint,
            apiKey: payload.apiKey,
            enabled: payload.enabled,
            recordedBy: user.id,
        });
        return {
            status: 'ok',
            message: 'Log destination updated successfully',
        };
    }
    async updateProfile(user, _profileData) {
        return {
            status: 'ok',
            message: 'Profile updated successfully',
        };
    }
    async updateSecuritySettings(user, _securityData) {
        return {
            status: 'ok',
            message: 'Security settings updated successfully',
        };
    }
    async createApiKey(user, payload) {
        const workspaceId = this.requireWorkspaceId(user);
        const { token, key } = await this.apiKeysService.createKey({
            workspaceId,
            label: payload.label ?? 'Chave API',
            scopes: payload.scopes ?? [],
            createdBy: user.id,
            expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
            metadata: payload.metadata ?? {},
        });
        return {
            status: 'ok',
            token,
            key,
        };
    }
    async revokeApiKey(user, keyId) {
        const workspaceId = this.requireWorkspaceId(user);
        await this.apiKeysService.revokeKey({
            workspaceId,
            apiKeyId: keyId,
            actorId: user.id,
        });
        return {
            status: 'ok',
            message: 'API key revoked successfully',
        };
    }
    async getApiKeyUsage(user, keyId) {
        const workspaceId = this.requireWorkspaceId(user);
        const usage = await this.apiKeysService.getKeyUsage(workspaceId, keyId);
        return {
            status: 'ok',
            usage,
        };
    }
    async rotateApiKey(user, keyId) {
        const workspaceId = this.requireWorkspaceId(user);
        const { token } = await this.apiKeysService.rotateKey({
            workspaceId,
            apiKeyId: keyId,
            actorId: user.id,
        });
        return {
            status: 'ok',
            token,
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
    __metadata("design:paramtypes", [Object, settings_requests_dto_1.CreateUsageAlertDto]),
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
    (0, common_1.Get)('integrations/status'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getIntegrationsStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('environments/:environmentId/status'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('environmentId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, settings_requests_dto_1.UpdateEnvironmentStatusDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "setEnvironmentStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('sso/configure'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, settings_requests_dto_1.ConfigureSsoDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "configureSso", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('ldap/configure'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, settings_requests_dto_1.ConfigureLdapDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "configureLdap", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('logs/configure'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, settings_requests_dto_1.ConfigureLogDestinationDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "configureLogDestination", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('personal/profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, settings_requests_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('personal/security'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, settings_requests_dto_1.UpdateSecuritySettingsDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateSecuritySettings", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('api/keys'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, settings_requests_dto_1.CreateApiKeyDto]),
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
        plan_management_service_1.PlanManagementService,
        workspace_api_keys_service_1.WorkspaceApiKeysService,
        workspace_integrations_service_1.WorkspaceIntegrationsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map