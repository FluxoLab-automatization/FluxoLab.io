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
exports.WorkspaceIntegrationsService = void 0;
const common_1 = require("@nestjs/common");
const workspace_integrations_repository_1 = require("../repositories/workspace-integrations.repository");
const workspace_integration_events_repository_1 = require("../repositories/workspace-integration-events.repository");
const workspace_environments_repository_1 = require("../repositories/workspace-environments.repository");
let WorkspaceIntegrationsService = class WorkspaceIntegrationsService {
    integrationsRepository;
    integrationEvents;
    environmentsRepository;
    constructor(integrationsRepository, integrationEvents, environmentsRepository) {
        this.integrationsRepository = integrationsRepository;
        this.integrationEvents = integrationEvents;
        this.environmentsRepository = environmentsRepository;
    }
    async getStatus(workspaceId) {
        const [secretProviders, logDestinations, ssoConfigs, ldapConfig, connectors,] = await Promise.all([
            this.integrationsRepository.listSecretProviders(workspaceId),
            this.integrationsRepository.listLogDestinations(workspaceId),
            this.integrationsRepository.listSsoConfigs(workspaceId),
            this.integrationsRepository.getLdapConfig(workspaceId),
            this.integrationsRepository.listCommunityConnectors(workspaceId),
        ]);
        return {
            secretProviders,
            logDestinations,
            ssoConfigs,
            ldap: ldapConfig,
            communityConnectors: connectors,
        };
    }
    async updateEnvironmentStatus(params) {
        const mappedStatus = params.status === 'active' ? 'ready' : 'disabled';
        const updated = await this.environmentsRepository.updateStatus({
            workspaceId: params.workspaceId,
            environmentId: params.environmentId,
            status: mappedStatus,
        });
        if (!updated) {
            return null;
        }
        await this.integrationEvents.recordEvent({
            workspaceId: params.workspaceId,
            integrationType: 'environment',
            integrationId: params.environmentId,
            status: mappedStatus,
        });
        return updated;
    }
    async configureSso(params) {
        await this.integrationsRepository.upsertSsoConfig({
            workspaceId: params.workspaceId,
            provider: params.provider,
            status: params.enabled ? 'active' : 'disabled',
            settings: {
                clientId: params.clientId,
                clientSecret: params.clientSecret,
            },
            metadata: {
                updatedAt: new Date().toISOString(),
            },
        });
        await this.integrationEvents.recordEvent({
            workspaceId: params.workspaceId,
            integrationType: 'sso',
            integrationId: params.provider,
            status: params.enabled ? 'active' : 'disabled',
            payload: {
                clientId: params.clientId,
            },
            recordedBy: params.recordedBy ?? null,
        });
    }
    async configureLdap(params) {
        await this.integrationsRepository.upsertLdapConfig({
            workspaceId: params.workspaceId,
            status: params.enabled ? 'configured' : 'inactive',
            host: params.host,
            baseDn: params.baseDn,
            settings: {
                port: params.port,
                bindDn: params.bindDn,
                bindPassword: params.bindPassword,
            },
            metadata: {
                updatedAt: new Date().toISOString(),
            },
        });
        await this.integrationEvents.recordEvent({
            workspaceId: params.workspaceId,
            integrationType: 'ldap',
            status: params.enabled ? 'configured' : 'inactive',
            payload: {
                host: params.host,
                baseDn: params.baseDn,
            },
            recordedBy: params.recordedBy ?? null,
        });
    }
    async configureLogDestination(params) {
        await this.integrationsRepository.upsertLogDestination({
            workspaceId: params.workspaceId,
            destination: params.destination,
            status: params.enabled ? 'configured' : 'available',
            config: {
                endpoint: params.endpoint,
                apiKey: params.apiKey ?? null,
            },
            metadata: {
                updatedAt: new Date().toISOString(),
            },
        });
        await this.integrationEvents.recordEvent({
            workspaceId: params.workspaceId,
            integrationType: 'log_destination',
            integrationId: params.destination,
            status: params.enabled ? 'configured' : 'available',
            payload: {
                endpoint: params.endpoint,
            },
            recordedBy: params.recordedBy ?? null,
        });
    }
};
exports.WorkspaceIntegrationsService = WorkspaceIntegrationsService;
exports.WorkspaceIntegrationsService = WorkspaceIntegrationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workspace_integrations_repository_1.WorkspaceIntegrationsRepository,
        workspace_integration_events_repository_1.WorkspaceIntegrationEventsRepository,
        workspace_environments_repository_1.WorkspaceEnvironmentsRepository])
], WorkspaceIntegrationsService);
//# sourceMappingURL=workspace-integrations.service.js.map