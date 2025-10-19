import { Injectable } from '@nestjs/common';
import { WorkspaceIntegrationsRepository } from '../repositories/workspace-integrations.repository';
import { WorkspaceIntegrationEventsRepository } from '../repositories/workspace-integration-events.repository';
import { WorkspaceEnvironmentsRepository } from '../repositories/workspace-environments.repository';

type EnvironmentStatusInput = 'active' | 'inactive';

@Injectable()
export class WorkspaceIntegrationsService {
  constructor(
    private readonly integrationsRepository: WorkspaceIntegrationsRepository,
    private readonly integrationEvents: WorkspaceIntegrationEventsRepository,
    private readonly environmentsRepository: WorkspaceEnvironmentsRepository,
  ) {}

  async getStatus(workspaceId: string) {
    const [
      secretProviders,
      logDestinations,
      ssoConfigs,
      ldapConfig,
      connectors,
    ] = await Promise.all([
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

  async updateEnvironmentStatus(params: {
    workspaceId: string;
    environmentId: string;
    status: EnvironmentStatusInput;
  }) {
    const mappedStatus =
      params.status === 'active' ? 'ready' : ('disabled' as const);
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

  async configureSso(params: {
    workspaceId: string;
    provider: string;
    clientId: string;
    clientSecret: string;
    enabled: boolean;
    recordedBy?: string | null;
  }) {
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

  async configureLdap(params: {
    workspaceId: string;
    host: string;
    baseDn: string;
    port: number;
    bindDn: string;
    bindPassword: string;
    enabled: boolean;
    recordedBy?: string | null;
  }) {
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

  async configureLogDestination(params: {
    workspaceId: string;
    destination: string;
    endpoint: string;
    apiKey?: string;
    enabled: boolean;
    recordedBy?: string | null;
  }) {
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
}
