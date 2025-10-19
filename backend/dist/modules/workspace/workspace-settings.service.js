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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceSettingsService = void 0;
const common_1 = require("@nestjs/common");
const workspaces_repository_1 = require("./repositories/workspaces.repository");
const plans_repository_1 = require("../billing/repositories/plans.repository");
const subscriptions_repository_1 = require("../billing/repositories/subscriptions.repository");
const workspace_members_repository_1 = require("./repositories/workspace-members.repository");
const workspace_usage_repository_1 = require("./repositories/workspace-usage.repository");
const workspace_api_keys_repository_1 = require("./repositories/workspace-api-keys.repository");
const workspace_environments_repository_1 = require("./repositories/workspace-environments.repository");
const workspace_integrations_repository_1 = require("./repositories/workspace-integrations.repository");
const planHierarchy = {
    free: 0,
    basico: 1,
    intermediario: 2,
    full: 3,
};
const featureGateDefinitions = {
    secrets: {
        title: 'Segredos externos',
        requiredPlan: 'Full',
        minimumRank: planHierarchy.full,
        copy: 'Integre cofres externos (AWS, Azure, HashiCorp) com rotacao automatica de credenciais.',
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
function normalizeLimit(value) {
    if (value === null || value === undefined) {
        return null;
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
        return null;
    }
    return numeric;
}
let WorkspaceSettingsService = class WorkspaceSettingsService {
    workspacesRepository;
    plansRepository;
    subscriptionsRepository;
    membersRepository;
    usageRepository;
    apiKeysRepository;
    environmentsRepository;
    integrationsRepository;
    constructor(workspacesRepository, plansRepository, subscriptionsRepository, membersRepository, usageRepository, apiKeysRepository, environmentsRepository, integrationsRepository) {
        this.workspacesRepository = workspacesRepository;
        this.plansRepository = plansRepository;
        this.subscriptionsRepository = subscriptionsRepository;
        this.membersRepository = membersRepository;
        this.usageRepository = usageRepository;
        this.apiKeysRepository = apiKeysRepository;
        this.environmentsRepository = environmentsRepository;
        this.integrationsRepository = integrationsRepository;
    }
    async getSummary(user) {
        const workspace = await this.workspacesRepository.findDefaultForUser(user.id);
        if (!workspace) {
            throw new common_1.NotFoundException('Workspace nao encontrado para o usuario autenticado.');
        }
        const plan = (workspace.planId &&
            (await this.plansRepository.findById(workspace.planId))) ||
            (await this.plansRepository.findByCode(workspace.settings.planCode ?? 'free')) ||
            (await this.plansRepository.findByCode('free'));
        if (!plan) {
            throw new common_1.NotFoundException('Plano associado ao workspace nao encontrado.');
        }
        const subscription = await this.subscriptionsRepository.findActiveByWorkspace(workspace.id);
        const usageSnapshot = await this.usageRepository.getLatestSnapshot(workspace.id);
        const activeMembersCount = await this.membersRepository.countActive(workspace.id);
        const apiKeys = await this.apiKeysRepository.listActive(workspace.id);
        const environments = await this.environmentsRepository.listByWorkspace(workspace.id);
        const secretProviders = await this.integrationsRepository.listSecretProviders(workspace.id);
        const ssoConfigs = await this.integrationsRepository.listSsoConfigs(workspace.id);
        const ldapConfig = await this.integrationsRepository.getLdapConfig(workspace.id);
        const logDestinations = await this.integrationsRepository.listLogDestinations(workspace.id);
        const communityConnectors = await this.integrationsRepository.listCommunityConnectors(workspace.id);
        const nowIso = new Date().toISOString();
        const usage = usageSnapshot
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
        const planSummary = {
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
        const mappedKeys = apiKeys.map((key) => ({
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
        const environmentSummaries = environments.map((env) => ({
            id: env.id,
            name: env.name,
            slug: env.slug,
            type: env.environment_type,
            region: env.region,
            status: env.status,
            lastSyncedAt: env.last_synced_at
                ? env.last_synced_at.toISOString()
                : null,
        }));
        const planCode = plan.code.toLowerCase();
        const planRank = planHierarchy[planCode] ?? 0;
        const hasConfiguredSecretProvider = secretProviders.some((provider) => ['configured', 'active'].includes(provider.status));
        const hasConfiguredSso = ssoConfigs.some((config) => ['active', 'review'].includes(config.status));
        const hasConfiguredLogs = logDestinations.some((destination) => ['configured', 'streaming'].includes(destination.status));
        const hasCommunityConnectors = communityConnectors.length > 0;
        const featureStatuses = {
            secrets: hasConfiguredSecretProvider ? 'configured' : 'available',
            environments: environmentSummaries.some((env) => env.status === 'ready' || env.status === 'locked')
                ? 'configured'
                : 'available',
            sso: hasConfiguredSso ? 'configured' : 'available',
            ldap: ldapConfig && ldapConfig.status !== 'inactive' ? 'configured' : 'available',
            logs: hasConfiguredLogs ? 'configured' : 'available',
            community: hasCommunityConnectors ? 'configured' : 'available',
        };
        const featureGates = Object.keys(featureGateDefinitions).map((id) => {
            const definition = featureGateDefinitions[id];
            const baseStatus = featureStatuses[id] ?? 'available';
            const status = planRank >= definition.minimumRank ? baseStatus : 'requires_upgrade';
            return {
                id,
                title: definition.title,
                requiredPlan: definition.requiredPlan,
                status,
                copy: definition.copy,
            };
        });
        const secretProviderSummaries = secretProviders.map((provider) => ({
            provider: provider.provider,
            status: provider.status,
            lastSyncedAt: provider.last_synced_at
                ? provider.last_synced_at.toISOString()
                : null,
        }));
        const ssoProviderSummaries = ssoConfigs.map((config) => ({
            provider: config.provider,
            status: config.status,
            enabledAt: config.enabled_at ? config.enabled_at.toISOString() : null,
            disabledAt: config.disabled_at
                ? config.disabled_at.toISOString()
                : null,
        }));
        const ldapSummary = ldapConfig
            ? {
                status: ldapConfig.status,
                host: ldapConfig.host,
                baseDn: ldapConfig.base_dn,
                lastSyncedAt: ldapConfig.last_synced_at
                    ? ldapConfig.last_synced_at.toISOString()
                    : null,
            }
            : null;
        const logDestinationSummaries = logDestinations.map((destination) => ({
            destination: destination.destination,
            status: destination.status,
            lastStreamedAt: destination.last_streamed_at
                ? destination.last_streamed_at.toISOString()
                : null,
            details: {
                ...destination.config,
                ...destination.metadata,
            },
        }));
        const communityConnectorSummaries = communityConnectors.map((connector) => ({
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
};
exports.WorkspaceSettingsService = WorkspaceSettingsService;
exports.WorkspaceSettingsService = WorkspaceSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workspaces_repository_1.WorkspacesRepository,
        plans_repository_1.PlansRepository,
        subscriptions_repository_1.SubscriptionsRepository,
        workspace_members_repository_1.WorkspaceMembersRepository,
        workspace_usage_repository_1.WorkspaceUsageRepository,
        workspace_api_keys_repository_1.WorkspaceApiKeysRepository,
        workspace_environments_repository_1.WorkspaceEnvironmentsRepository,
        workspace_integrations_repository_1.WorkspaceIntegrationsRepository])
], WorkspaceSettingsService);
//# sourceMappingURL=workspace-settings.service.js.map