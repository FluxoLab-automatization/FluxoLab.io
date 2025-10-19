import { WorkspaceIntegrationsRepository } from '../repositories/workspace-integrations.repository';
import { WorkspaceIntegrationEventsRepository } from '../repositories/workspace-integration-events.repository';
import { WorkspaceEnvironmentsRepository } from '../repositories/workspace-environments.repository';
type EnvironmentStatusInput = 'active' | 'inactive';
export declare class WorkspaceIntegrationsService {
    private readonly integrationsRepository;
    private readonly integrationEvents;
    private readonly environmentsRepository;
    constructor(integrationsRepository: WorkspaceIntegrationsRepository, integrationEvents: WorkspaceIntegrationEventsRepository, environmentsRepository: WorkspaceEnvironmentsRepository);
    getStatus(workspaceId: string): Promise<{
        secretProviders: import("../repositories/workspace-integrations.repository").SecretProviderRecord[];
        logDestinations: import("../repositories/workspace-integrations.repository").LogDestinationRecord[];
        ssoConfigs: import("../repositories/workspace-integrations.repository").SsoConfigRecord[];
        ldap: import("../repositories/workspace-integrations.repository").LdapConfigRecord | null;
        communityConnectors: import("../repositories/workspace-integrations.repository").CommunityConnectorRecord[];
    }>;
    updateEnvironmentStatus(params: {
        workspaceId: string;
        environmentId: string;
        status: EnvironmentStatusInput;
    }): Promise<import("../repositories/workspace-environments.repository").EnvironmentRecord | null>;
    configureSso(params: {
        workspaceId: string;
        provider: string;
        clientId: string;
        clientSecret: string;
        enabled: boolean;
        recordedBy?: string | null;
    }): Promise<void>;
    configureLdap(params: {
        workspaceId: string;
        host: string;
        baseDn: string;
        port: number;
        bindDn: string;
        bindPassword: string;
        enabled: boolean;
        recordedBy?: string | null;
    }): Promise<void>;
    configureLogDestination(params: {
        workspaceId: string;
        destination: string;
        endpoint: string;
        apiKey?: string;
        enabled: boolean;
        recordedBy?: string | null;
    }): Promise<void>;
}
export {};
