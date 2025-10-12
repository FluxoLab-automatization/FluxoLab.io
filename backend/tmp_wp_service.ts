import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PlansRepository,
  WorkspacePlan,
} from './src/modules/billing/repositories/plans.repository';
import {
  SubscriptionsRepository,
  WorkspaceSubscription,
} from './src/modules/billing/repositories/subscriptions.repository';
import {
  WorkspacesRepository,
  WorkspaceEntity,
} from './src/modules/workspace/repositories/workspaces.repository';
import { WorkspaceMembersRepository } from './src/modules/workspace/repositories/workspace-members.repository';
import { WorkspaceSettingsRepository } from './src/modules/workspace/repositories/workspace-settings.repository';
import { ProfilesRepository } from './src/modules/auth/profiles.repository';

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
    private readonly profilesRepository: ProfilesRepository,
  ) {}

  async provisionInitialWorkspace(
    params: ProvisionWorkspaceParams,
  ): Promise<ProvisionWorkspaceResult> {
    const planCode = params.planCode ?? 'free';
    const plan = await this.plansRepository.findByCode(planCode);
    if (!plan || !plan.isActive) {
      throw new NotFoundException(`Plano ${planCode} nao encontrado ou inativo`);
    }

    const workspaceName = params.workspaceName?.trim() || 'Workspace FluxoLab';
    const slug = await this.workspacesRepository.generateUniqueSlug(workspaceName);

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

    const adminProfileId = await this.profilesRepository.getRequiredProfileId('admin');
    await this.membersRepository.addOrActivateMember({
      workspaceId: workspace.id,
      userId: params.userId,
      profileId: adminProfileId,
      invitedBy: params.assignedBy ?? null,
    });

    const subscription = await this.subscriptionsRepository.createInitialSubscription({
      workspaceId: workspace.id,
      planId: plan.id,
      trialDays: plan.trialDays,
      metadata: { planCode: plan.code },
    });

    return { workspace, subscription, plan };
  }
}
