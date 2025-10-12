import { Injectable, NotFoundException } from '@nestjs/common';
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
  createdBy: { id: string; email: string | null } | null;
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

const planHierarchy: Record<string, number> = {
  free: 0,
  basico: 1,
  intermediario: 2,
  full: 3,
};

const featureGateDefinitions: Record<
  FeatureGateSummary['id'],
  { title: string; requiredPlan: string; copy: string; minimumRank: number }
> = {
  secrets: {
    title: 'Segredos externos',
    requiredPlan: 'Full',
    minimumRank: planHierarchy.full,
    copy:
      'Integre cofres externos (AWS, Azure, HashiCorp) com rotacao automatica de credenciais.',
  },
  environments: {
    title: 'Ambientes',
    requiredPlan: 'Intermediario',
    minimumRank: planHierarchy.intermediario,
    copy: 'Orquestre pipelines Sandbox, Staging e Producao com aprovacao.',
  },
  sso: {
    title: 'SSO',
    requiredPlan: 'Full',
    minimumRank: planHierarchy.full,
    copy: 'Ative SAML/OIDC com provisionamento SCIM para seu IdP corporativo.',
  },
  ldap: {
    title: 'LDAP',
    requiredPlan: 'Full',
    minimumRank: planHierarchy.full,
    copy: 'Sincronize hierarquia de times a partir do seu diretorio legado.',
  },
  logs: {
    title: 'Log streaming',
    requiredPlan: 'Intermediario',
    minimumRank: planHierarchy.intermediario,
    copy: 'Envie auditoria e execucoes em tempo real para Splunk, Datadog e S3.',
  },
  community: {
    title: 'Conectores comunitarios',
    requiredPlan: 'Basico',
    minimumRank: planHierarchy.basico,
    copy: 'Acesse integrações certificadas pela comunidade FluxoLab.',
  },
};

function normalizeLimit(
  value: unknown,
): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return null;
  }
  return numeric;
}

@Injectable()
export class WorkspaceSettingsService {
  constructor(
    private readonly workspacesRepository: WorkspacesRepository,
    private readonly plansRepository: PlansRepository,
    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly membersRepository: WorkspaceMembersRepository,
    private readonly usageRepository: WorkspaceUsageRepository,
    private readonly apiKeysRepository: WorkspaceApiKeysRepository,
    private readonly environmentsRepository: WorkspaceEnvironmentsRepository,
    private readonly integrationsRepository: WorkspaceIntegrationsRepository,
  ) {}

  async getSummary(user: AuthenticatedUser): Promise<WorkspaceSettingsSummary> {
    const workspace = await this.workspacesRepository.findDefaultForUser(
      user.id,
    );

    if (!workspace) {
      throw new NotFoundException(
        'Workspace nao encontrado para o usuario autenticado.',
      );
    }

    const plan =
      (workspace.planId &&
        (await this.plansRepository.findById(workspace.planId))) ||
      (await this.plansRepository.findByCode(
        (workspace.settings.planCode as string) ?? 'free',
      )) ||
      (await this.plansRepository.findByCode('free'));

    if (!plan) {
      throw new NotFoundException('Plano associado ao workspace nao encontrado.');
    }

    const subscription =
      await this.subscriptionsRepository.findActiveByWorkspace(workspace.id);

    const usageSnapshot =
      await this.usageRepository.getLatestSnapshot(workspace.id);

    const activeMembersCount =
      await this.membersRepository.countActive(workspace.id);

    const apiKeys = await this.apiKeysRepository.listActive(workspace.id);
    const environments =
      await this.environmentsRepository.listByWorkspace(workspace.id);
    const secretProviders =
      await this.integrationsRepository.listSecretProviders(workspace.id);
    const ssoConfigs =
      await this.integrationsRepository.listSsoConfigs(workspace.id);
    const ldapConfig =
      await this.integrationsRepository.getLdapConfig(workspace.id);
    const logDestinations =
      await this.integrationsRepository.listLogDestinations(workspace.id);
    const communityConnectors =
      await this.integrationsRepository.listCommunityConnectors(workspace.id);

    const nowIso = new Date().toISOString();

    const usage: UsageSummary = usageSnapshot
      ? {
          workflowsActive: usageSnapshot.workflowsActive,
          usersActive: usageSnapshot.usersActive,
          webhookEvents: usageSnapshot.webhookEvents,
          collectedAt: usageSnapshot.collectedAt,
        }
      : {
          workflowsActive: 0,
          usersActive: activeMembersCount,
          webhookEvents: 0,
          collectedAt: nowIso,
        };

    const limitsMetadata = plan.metadata ?? {};

    const planSummary: PlanLimitsSummary = {
      id: plan.id,
      code: plan.code,
      name: plan.name,
      description: plan.description ?? null,
      priceAmount: plan.priceAmount,
      currency: plan.currency,
      billingInterval: plan.billingInterval,
      trialDays: plan.trialDays,
      limits: {
        workspaces: normalizeLimit(limitsMetadata.max_workspaces),
        users: normalizeLimit(limitsMetadata.max_users),
        webhook: normalizeLimit(limitsMetadata.webhook_limit),
      },
      features: plan.features,
      subscriptionStatus: subscription?.status ?? null,
      trialEndsAt: subscription?.trialEndsAt
        ? subscription.trialEndsAt.toISOString()
        : null,
      renewsAt: subscription?.renewsAt
        ? subscription.renewsAt.toISOString()
        : null,
    };

    const mappedKeys: ApiKeySummary[] = apiKeys.map((key) => ({
      id: key.id,
      label: key.label,
      keyPreview: key.key_preview,
      scopes: key.scopes,
      status: key.status,
      createdAt: key.created_at.toISOString(),
      lastUsedAt: key.last_used_at ? key.last_used_at.toISOString() : null,
      createdBy: key.created_by
        ? { id: key.created_by, email: key.created_by_email }
        : null,
    }));

    const environmentSummaries: EnvironmentSummary[] = environments.map(
      (env) => ({
        id: env.id,
        name: env.name,
        slug: env.slug,
        type: env.environment_type,
        region: env.region,
        status: env.status,
        lastSyncedAt: env.last_synced_at
          ? env.last_synced_at.toISOString()
          : null,
      }),
    );

    const planCode = plan.code.toLowerCase();
    const planRank = planHierarchy[planCode] ?? 0;

    const hasConfiguredSecretProvider = secretProviders.some((provider) =>
      ['configured', 'active'].includes(provider.status),
    );
    const hasConfiguredSso = ssoConfigs.some((config) =>
      ['active', 'review'].includes(config.status),
    );
    const hasConfiguredLogs = logDestinations.some((destination) =>
      ['configured', 'streaming'].includes(destination.status),
    );
    const hasCommunityConnectors = communityConnectors.length > 0;

    const featureStatuses: Record<string, FeatureGateSummary['status']> = {
      secrets: hasConfiguredSecretProvider ? 'configured' : 'available',
      environments: environmentSummaries.some(
        (env) => env.status === 'ready' || env.status === 'locked',
      )
        ? 'configured'
        : 'available',
      sso: hasConfiguredSso ? 'configured' : 'available',
      ldap: ldapConfig && ldapConfig.status !== 'inactive' ? 'configured' : 'available',
      logs: hasConfiguredLogs ? 'configured' : 'available',
      community: hasCommunityConnectors ? 'configured' : 'available',
    };

    const featureGates: FeatureGateSummary[] = (Object.keys(
      featureGateDefinitions,
    ) as FeatureGateSummary['id'][]).map((id) => {
      const definition = featureGateDefinitions[id];
      const baseStatus = featureStatuses[id] ?? 'available';
      const status =
        planRank >= definition.minimumRank ? baseStatus : 'requires_upgrade';
      return {
        id,
        title: definition.title,
        requiredPlan: definition.requiredPlan,
        status,
        copy: definition.copy,
      };
    });

    const secretProviderSummaries: SecretProviderSummary[] =
      secretProviders.map((provider) => ({
        provider: provider.provider,
        status: provider.status,
        lastSyncedAt: provider.last_synced_at
          ? provider.last_synced_at.toISOString()
          : null,
      }));

    const ssoProviderSummaries: SsoProviderSummary[] = ssoConfigs.map(
      (config) => ({
        provider: config.provider,
        status: config.status,
        enabledAt: config.enabled_at ? config.enabled_at.toISOString() : null,
        disabledAt: config.disabled_at
          ? config.disabled_at.toISOString()
          : null,
      }),
    );

    const ldapSummary: LdapSummary | null = ldapConfig
      ? {
          status: ldapConfig.status,
          host: ldapConfig.host,
          baseDn: ldapConfig.base_dn,
          lastSyncedAt: ldapConfig.last_synced_at
            ? ldapConfig.last_synced_at.toISOString()
            : null,
        }
      : null;

    const logDestinationSummaries: LogDestinationSummary[] = logDestinations.map(
      (destination) => ({
        destination: destination.destination,
        status: destination.status,
        lastStreamedAt: destination.last_streamed_at
          ? destination.last_streamed_at.toISOString()
          : null,
        details: {
          ...destination.config,
          ...destination.metadata,
        },
      }),
    );

    const communityConnectorSummaries: CommunityConnectorSummary[] =
      communityConnectors.map((connector) => ({
        name: connector.name,
        author: connector.author,
        status: connector.status,
        createdAt: connector.created_at.toISOString(),
      }));

    return {
      workspaceId: workspace.id,
      plan: planSummary,
      usage,
      apiKeys: mappedKeys,
      environments: environmentSummaries,
      featureGates,
      secretProviders: secretProviderSummaries,
      ssoProviders: ssoProviderSummaries,
      ldap: ldapSummary,
      logDestinations: logDestinationSummaries,
      communityConnectors: communityConnectorSummaries,
    };
  }
}
