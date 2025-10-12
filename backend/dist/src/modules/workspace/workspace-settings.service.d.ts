import type { AuthenticatedUser } from '../auth/auth.types';
import { WorkspacesRepository } from './repositories/workspaces.repository';
import { PlansRepository } from '../billing/repositories/plans.repository';
import { SubscriptionsRepository } from '../billing/repositories/subscriptions.repository';
import { WorkspaceMembersRepository } from './repositories/workspace-members.repository';
import { WorkspaceUsageRepository } from './repositories/workspace-usage.repository';
import { WorkspaceApiKeysRepository } from './repositories/workspace-api-keys.repository';
import { WorkspaceEnvironmentsRepository } from './repositories/workspace-environments.repository';
import { WorkspaceIntegrationsRepository } from './repositories/workspace-integrations.repository';
interface PlanLimitsSummary {
    id: string;
    code: string;
    name: string;
    description: string | null;
    priceAmount: number;
    currency: string;
    billingInterval: 'month' | 'year';
    trialDays: number;
    limits: {
        workspaces: number | null;
        users: number | null;
        webhook: number | null;
    };
    features: Record<string, unknown>;
    subscriptionStatus: string | null;
    trialEndsAt: string | null;
    renewsAt: string | null;
}
interface UsageSummary {
    workflowsActive: number;
    usersActive: number;
    webhookEvents: number;
    collectedAt: string;
}
interface ApiKeySummary {
    id: string;
    label: string;
    keyPreview: string;
    scopes: string[];
    status: string;
    createdAt: string;
    lastUsedAt: string | null;
    createdBy: {
        id: string;
        email: string | null;
    } | null;
}
interface EnvironmentSummary {
    id: string;
    name: string;
    slug: string;
    type: string;
    region: string | null;
    status: string;
    lastSyncedAt: string | null;
}
interface FeatureGateSummary {
    id: string;
    title: string;
    requiredPlan: string;
    status: 'available' | 'requires_upgrade' | 'configured' | 'coming_soon';
    copy: string;
}
interface SecretProviderSummary {
    provider: string;
    status: string;
    lastSyncedAt: string | null;
}
interface SsoProviderSummary {
    provider: string;
    status: string;
    enabledAt: string | null;
    disabledAt: string | null;
}
interface LdapSummary {
    status: string;
    host: string | null;
    baseDn: string | null;
    lastSyncedAt: string | null;
}
interface LogDestinationSummary {
    destination: string;
    status: string;
    lastStreamedAt: string | null;
    details: Record<string, unknown>;
}
interface CommunityConnectorSummary {
    name: string;
    author: string | null;
    status: string;
    createdAt: string;
}
export interface WorkspaceSettingsSummary {
    workspaceId: string;
    plan: PlanLimitsSummary;
    usage: UsageSummary;
    apiKeys: ApiKeySummary[];
    environments: EnvironmentSummary[];
    featureGates: FeatureGateSummary[];
    secretProviders: SecretProviderSummary[];
    ssoProviders: SsoProviderSummary[];
    ldap: LdapSummary | null;
    logDestinations: LogDestinationSummary[];
    communityConnectors: CommunityConnectorSummary[];
}
export declare class WorkspaceSettingsService {
    private readonly workspacesRepository;
    private readonly plansRepository;
    private readonly subscriptionsRepository;
    private readonly membersRepository;
    private readonly usageRepository;
    private readonly apiKeysRepository;
    private readonly environmentsRepository;
    private readonly integrationsRepository;
    constructor(workspacesRepository: WorkspacesRepository, plansRepository: PlansRepository, subscriptionsRepository: SubscriptionsRepository, membersRepository: WorkspaceMembersRepository, usageRepository: WorkspaceUsageRepository, apiKeysRepository: WorkspaceApiKeysRepository, environmentsRepository: WorkspaceEnvironmentsRepository, integrationsRepository: WorkspaceIntegrationsRepository);
    getSummary(user: AuthenticatedUser): Promise<WorkspaceSettingsSummary>;
}
export {};
