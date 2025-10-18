"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceModule = void 0;
const common_1 = require("@nestjs/common");
const workspace_controller_1 = require("./workspace.controller");
const settings_controller_1 = require("./settings.controller");
const workspace_service_1 = require("./workspace.service");
const conversations_repository_1 = require("./repositories/conversations.repository");
const activities_repository_1 = require("./repositories/activities.repository");
const webhook_events_repository_1 = require("./repositories/webhook-events.repository");
const auth_module_1 = require("../auth/auth.module");
const billing_module_1 = require("../billing/billing.module");
const workspaces_repository_1 = require("./repositories/workspaces.repository");
const workspace_members_repository_1 = require("./repositories/workspace-members.repository");
const workspace_settings_repository_1 = require("./repositories/workspace-settings.repository");
const workspace_api_keys_repository_1 = require("./repositories/workspace-api-keys.repository");
const workspace_environments_repository_1 = require("./repositories/workspace-environments.repository");
const workspace_integrations_repository_1 = require("./repositories/workspace-integrations.repository");
const workspace_usage_repository_1 = require("./repositories/workspace-usage.repository");
const workspace_settings_service_1 = require("./workspace-settings.service");
const workspace_provisioning_service_1 = require("./workspace-provisioning.service");
const usage_analytics_service_1 = require("./services/usage-analytics.service");
const plan_management_service_1 = require("./services/plan-management.service");
let WorkspaceModule = class WorkspaceModule {
};
exports.WorkspaceModule = WorkspaceModule;
exports.WorkspaceModule = WorkspaceModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => auth_module_1.AuthModule), billing_module_1.BillingModule],
        controllers: [workspace_controller_1.WorkspaceController, settings_controller_1.SettingsController],
        providers: [
            workspace_service_1.WorkspaceService,
            workspace_settings_service_1.WorkspaceSettingsService,
            workspace_provisioning_service_1.WorkspaceProvisioningService,
            usage_analytics_service_1.UsageAnalyticsService,
            plan_management_service_1.PlanManagementService,
            conversations_repository_1.ConversationsRepository,
            activities_repository_1.ActivitiesRepository,
            webhook_events_repository_1.WorkspaceWebhookRepository,
            workspaces_repository_1.WorkspacesRepository,
            workspace_members_repository_1.WorkspaceMembersRepository,
            workspace_settings_repository_1.WorkspaceSettingsRepository,
            workspace_api_keys_repository_1.WorkspaceApiKeysRepository,
            workspace_environments_repository_1.WorkspaceEnvironmentsRepository,
            workspace_integrations_repository_1.WorkspaceIntegrationsRepository,
            workspace_usage_repository_1.WorkspaceUsageRepository,
        ],
        exports: [
            workspace_service_1.WorkspaceService,
            workspace_settings_service_1.WorkspaceSettingsService,
            workspace_provisioning_service_1.WorkspaceProvisioningService,
            usage_analytics_service_1.UsageAnalyticsService,
            plan_management_service_1.PlanManagementService,
            workspaces_repository_1.WorkspacesRepository,
            workspace_environments_repository_1.WorkspaceEnvironmentsRepository,
            workspace_api_keys_repository_1.WorkspaceApiKeysRepository,
            workspace_integrations_repository_1.WorkspaceIntegrationsRepository,
            workspace_usage_repository_1.WorkspaceUsageRepository,
        ],
    })
], WorkspaceModule);
//# sourceMappingURL=workspace.module.js.map