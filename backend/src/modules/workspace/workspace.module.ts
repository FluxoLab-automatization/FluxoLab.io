import { Module } from '@nestjs/common';
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
import { WorkspaceEnvironmentsRepository } from './repositories/workspace-environments.repository';
import { WorkspaceIntegrationsRepository } from './repositories/workspace-integrations.repository';
import { WorkspaceUsageRepository } from './repositories/workspace-usage.repository';
import { WorkspaceSettingsService } from './workspace-settings.service';
import { WorkspaceProvisioningService } from './workspace-provisioning.service';

@Module({
  imports: [AuthModule, BillingModule],
  controllers: [WorkspaceController, SettingsController],
  providers: [
    WorkspaceService,
    WorkspaceSettingsService,
    WorkspaceProvisioningService,
    ConversationsRepository,
    ActivitiesRepository,
    WorkspaceWebhookRepository,
    WorkspacesRepository,
    WorkspaceMembersRepository,
    WorkspaceSettingsRepository,
    WorkspaceApiKeysRepository,
    WorkspaceEnvironmentsRepository,
    WorkspaceIntegrationsRepository,
    WorkspaceUsageRepository,
  ],
  exports: [
    WorkspaceService,
    WorkspaceSettingsService,
    WorkspaceProvisioningService,
    WorkspacesRepository,
    WorkspaceEnvironmentsRepository,
    WorkspaceApiKeysRepository,
    WorkspaceIntegrationsRepository,
    WorkspaceUsageRepository,
  ],
})
export class WorkspaceModule {}
