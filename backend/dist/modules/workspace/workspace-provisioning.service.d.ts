import { PlansRepository, WorkspacePlan } from '../billing/repositories/plans.repository';
import { SubscriptionsRepository, WorkspaceSubscription } from '../billing/repositories/subscriptions.repository';
import { WorkspacesRepository, WorkspaceEntity } from './repositories/workspaces.repository';
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
export declare class WorkspaceProvisioningService {
    private readonly plansRepository;
    private readonly subscriptionsRepository;
    private readonly workspacesRepository;
    private readonly membersRepository;
    private readonly settingsRepository;
    private readonly environmentsRepository;
    private readonly integrationsRepository;
    private readonly profilesRepository;
    private readonly usersRepository;
    constructor(plansRepository: PlansRepository, subscriptionsRepository: SubscriptionsRepository, workspacesRepository: WorkspacesRepository, membersRepository: WorkspaceMembersRepository, settingsRepository: WorkspaceSettingsRepository, environmentsRepository: WorkspaceEnvironmentsRepository, integrationsRepository: WorkspaceIntegrationsRepository, profilesRepository: ProfilesRepository, usersRepository: UsersRepository);
    provisionInitialWorkspace(params: ProvisionWorkspaceParams): Promise<ProvisionWorkspaceResult>;
}
