import { PlansRepository, WorkspacePlan } from './src/modules/billing/repositories/plans.repository';
import { SubscriptionsRepository, WorkspaceSubscription } from './src/modules/billing/repositories/subscriptions.repository';
import { WorkspacesRepository, WorkspaceEntity } from './src/modules/workspace/repositories/workspaces.repository';
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
export declare class WorkspaceProvisioningService {
    private readonly plansRepository;
    private readonly subscriptionsRepository;
    private readonly workspacesRepository;
    private readonly membersRepository;
    private readonly settingsRepository;
    private readonly profilesRepository;
    constructor(plansRepository: PlansRepository, subscriptionsRepository: SubscriptionsRepository, workspacesRepository: WorkspacesRepository, membersRepository: WorkspaceMembersRepository, settingsRepository: WorkspaceSettingsRepository, profilesRepository: ProfilesRepository);
    provisionInitialWorkspace(params: ProvisionWorkspaceParams): Promise<ProvisionWorkspaceResult>;
}
