import { Module, forwardRef } from '@nestjs/common';
import { WorkspaceController } from './workspace.controller';
import { SettingsController } from './settings.controller';
import { WorkspaceService } from './workspace.service';
import { ConversationsRepository } from './repositories/conversations.repository';
import { ActivitiesRepository } from './repositories/activities.repository';
import { WorkspaceWebhookRepository } from './repositories/webhook-events.repository';
import { AuthModule } from '../auth/auth.module';
import { BillingModule } from '../billing/billing.module';
import { WorkspacesRepository } from './repositories/workspaces.repository';
import { WorkspaceMembersRepository } from './repositories/workspace-members.repository';
import { WorkspaceSettingsRepository } from './repositories/workspace-settings.repository';
import { WorkspaceApiKeysRepository } from './repositories/workspace-api-keys.repository';
import { WorkspaceApiKeyAuditRepository } from './repositories/workspace-api-key-audit.repository';
import { WorkspaceEnvironmentsRepository } from './repositories/workspace-environments.repository';
import { WorkspaceIntegrationsRepository } from './repositories/workspace-integrations.repository';
import { WorkspaceUsageRepository } from './repositories/workspace-usage.repository';
import { WorkspaceUsageAlertsRepository } from './repositories/workspace-usage-alerts.repository';
import { WorkspaceIntegrationEventsRepository } from './repositories/workspace-integration-events.repository';
import { WorkspaceSettingsService } from './workspace-settings.service';
import { WorkspaceProvisioningService } from './workspace-provisioning.service';
import { UsageAnalyticsService } from './services/usage-analytics.service';
import { PlanManagementService } from './services/plan-management.service';
import { WorkspaceApiKeysService } from './services/workspace-api-keys.service';
import { WorkspaceIntegrationsService } from './services/workspace-integrations.service';

@Module({
  imports: [forwardRef(() => AuthModule), BillingModule],
  controllers: [WorkspaceController, SettingsController],
  providers: [
    WorkspaceService,
    WorkspaceSettingsService,
    WorkspaceProvisioningService,
    WorkspaceApiKeysService,
    WorkspaceIntegrationsService,
    UsageAnalyticsService,
    PlanManagementService,
    ConversationsRepository,
    ActivitiesRepository,
    WorkspaceWebhookRepository,
    WorkspacesRepository,
    WorkspaceMembersRepository,
    WorkspaceSettingsRepository,
    WorkspaceApiKeysRepository,
    WorkspaceApiKeyAuditRepository,
    WorkspaceEnvironmentsRepository,
    WorkspaceIntegrationsRepository,
    WorkspaceUsageRepository,
    WorkspaceUsageAlertsRepository,
    WorkspaceIntegrationEventsRepository,
  ],
  exports: [
    WorkspaceService,
    WorkspaceSettingsService,
    WorkspaceProvisioningService,
    WorkspaceApiKeysService,
    WorkspaceIntegrationsService,
    UsageAnalyticsService,
    PlanManagementService,
    WorkspacesRepository,
    WorkspaceEnvironmentsRepository,
    WorkspaceApiKeysRepository,
    WorkspaceIntegrationsRepository,
    WorkspaceUsageRepository,
    WorkspaceUsageAlertsRepository,
    WorkspaceIntegrationEventsRepository,
    WorkspaceApiKeyAuditRepository,
  ],
})
export class WorkspaceModule {}
