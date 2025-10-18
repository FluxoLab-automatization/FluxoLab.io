import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PlansRepository,
  WorkspacePlan,
} from '../billing/repositories/plans.repository';
import {
  SubscriptionsRepository,
  WorkspaceSubscription,
} from '../billing/repositories/subscriptions.repository';
import {
  WorkspacesRepository,
  WorkspaceEntity,
} from './repositories/workspaces.repository';
import { WorkspaceMembersRepository } from './repositories/workspace-members.repository';
import { WorkspaceSettingsRepository } from './repositories/workspace-settings.repository';
import { WorkspaceEnvironmentsRepository } from './repositories/workspace-environments.repository';
import { WorkspaceIntegrationsRepository } from './repositories/workspace-integrations.repository';
import { ProfilesRepository } from '../auth/profiles.repository';
import { UsersRepository } from '../auth/users.repository';

export interface ProvisionWorkspaceParams {
  userId: string;
  workspaceName?: string;
  planCode?: string;
  region?: string | null;
  timezone?: string;
  assignedBy?: string | null;
}

export interface ProvisionWorkspaceResult {
  workspace: WorkspaceEntity;
  subscription: WorkspaceSubscription;
  plan: WorkspacePlan;
}

@Injectable()
export class WorkspaceProvisioningService {
  constructor(
    private readonly plansRepository: PlansRepository,
    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly workspacesRepository: WorkspacesRepository,
    private readonly membersRepository: WorkspaceMembersRepository,
    private readonly settingsRepository: WorkspaceSettingsRepository,
    private readonly environmentsRepository: WorkspaceEnvironmentsRepository,
    private readonly integrationsRepository: WorkspaceIntegrationsRepository,
    private readonly profilesRepository: ProfilesRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async provisionInitialWorkspace(
    params: ProvisionWorkspaceParams,
  ): Promise<ProvisionWorkspaceResult> {
    const planCode = params.planCode ?? 'free';
    const plan = await this.plansRepository.findByCode(planCode);
    if (!plan || !plan.isActive) {
      throw new NotFoundException(
        `Plano ${planCode} nao encontrado ou inativo`,
      );
    }

    const workspaceName = params.workspaceName?.trim() || 'Workspace FluxoLab';
    const slug =
      await this.workspacesRepository.generateUniqueSlug(workspaceName);

    const workspace = await this.workspacesRepository.createWorkspace({
      ownerId: params.userId,
      planId: plan.id,
      name: workspaceName,
      slug,
      timezone: params.timezone,
      region: params.region ?? 'br-sao',
      settings: {
        planCode,
        provisionedAt: new Date().toISOString(),
      },
    });

    await this.settingsRepository.ensureDefaults(workspace.id);
    await this.environmentsRepository.ensureDefaultEnvironments(workspace.id);
    await this.integrationsRepository.seedPlaceholders(workspace.id);

    const adminProfileId =
      await this.profilesRepository.getRequiredProfileId('admin');
    await this.membersRepository.addOrActivateMember({
      workspaceId: workspace.id,
      userId: params.userId,
      profileId: adminProfileId,
      invitedBy: params.assignedBy ?? null,
    });

    const subscription =
      await this.subscriptionsRepository.createInitialSubscription({
        workspaceId: workspace.id,
        planId: plan.id,
        trialDays: plan.trialDays,
        metadata: {
          planCode: plan.code,
        },
      });

    await this.usersRepository.setDefaultWorkspace(params.userId, workspace.id);

    return { workspace, subscription, plan };
  }
}
