import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';

export interface SecretProviderRecord {
  provider: string;
  status: string;
  metadata: Record<string, unknown> | null;
  last_synced_at: Date | null;
}

export interface SsoConfigRecord {
  provider: string;
  status: string;
  metadata: Record<string, unknown> | null;
  enabled_at: Date | null;
  disabled_at: Date | null;
}

export interface LdapConfigRecord {
  status: string;
  host: string | null;
  base_dn: string | null;
  metadata: Record<string, unknown> | null;
  last_synced_at: Date | null;
}

export interface LogDestinationRecord {
  destination: string;
  status: string;
  config: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  last_streamed_at: Date | null;
}

export interface CommunityConnectorRecord {
  name: string;
  author: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
  created_at: Date;
}

@Injectable()
export class WorkspaceIntegrationsRepository {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  async seedPlaceholders(workspaceId: string): Promise<void> {
    await this.pool.query(
      `
        INSERT INTO workspace_secret_providers (workspace_id, provider, status, metadata)
        VALUES
          ($1, 'aws_secrets_manager', 'requires_upgrade', jsonb_build_object('seed', 'default')),
          ($1, 'azure_key_vault', 'requires_upgrade', jsonb_build_object('seed', 'default'))
        ON CONFLICT (workspace_id, provider) DO NOTHING
      `,
      [workspaceId],
    );

    await this.pool.query(
      `
        INSERT INTO workspace_log_destinations (workspace_id, destination, status, metadata)
        VALUES
          ($1, 'splunk', 'configured', jsonb_build_object('seed', 'default', 'index', 'fluxolab_prod')),
          ($1, 'datadog', 'available', jsonb_build_object('seed', 'default')),
          ($1, 's3_glacier', 'requires_upgrade', jsonb_build_object('seed', 'default'))
        ON CONFLICT (workspace_id, destination) DO NOTHING
      `,
      [workspaceId],
    );

    await this.pool.query(
      `
        INSERT INTO workspace_sso_configs (workspace_id, provider, status, metadata)
        VALUES
          ($1, 'okta', 'active', jsonb_build_object('seed', 'default')),
          ($1, 'azure_ad', 'review', jsonb_build_object('seed', 'default')),
          ($1, 'google_workspace', 'draft', jsonb_build_object('seed', 'default'))
        ON CONFLICT (workspace_id, provider) DO NOTHING
      `,
      [workspaceId],
    );

    await this.pool.query(
      `
        INSERT INTO workspace_ldap_configs (workspace_id, host, base_dn, status, metadata)
        VALUES
          ($1, 'ldap.corp.local', 'dc=corp,dc=local', 'inactive', jsonb_build_object('seed', 'default'))
        ON CONFLICT (workspace_id) DO NOTHING
      `,
      [workspaceId],
    );

    await this.pool.query(
      `
        INSERT INTO workspace_community_connectors (workspace_id, name, author, status, metadata)
        VALUES
          ($1, 'Webhook Inspector', 'Labs Squad', 'certified', jsonb_build_object('seed', 'default')),
          ($1, 'Banco Central PIX', 'Parceiros Fintech', 'in_review', jsonb_build_object('seed', 'default')),
          ($1, 'WhatsApp Cloud Alerts', 'FluxoLab Community', 'certified', jsonb_build_object('seed', 'default'))
        ON CONFLICT (workspace_id, name) DO NOTHING
      `,
      [workspaceId],
    );
  }

  async listSecretProviders(
    workspaceId: string,
  ): Promise<SecretProviderRecord[]> {
    const result = await this.pool.query<SecretProviderRecord>(
      `
        SELECT provider,
               status,
               metadata,
               last_synced_at
          FROM workspace_secret_providers
         WHERE workspace_id = $1
         ORDER BY provider ASC
      `,
      [workspaceId],
    );

    return result.rows;
  }

  async listLogDestinations(
    workspaceId: string,
  ): Promise<LogDestinationRecord[]> {
    const result = await this.pool.query<LogDestinationRecord>(
      `
        SELECT destination,
               status,
               config,
               metadata,
               last_streamed_at
          FROM workspace_log_destinations
         WHERE workspace_id = $1
         ORDER BY destination ASC
      `,
      [workspaceId],
    );

    return result.rows;
  }

  async listSsoConfigs(workspaceId: string): Promise<SsoConfigRecord[]> {
    const result = await this.pool.query<SsoConfigRecord>(
      `
        SELECT provider,
               status,
               metadata,
               enabled_at,
               disabled_at
          FROM workspace_sso_configs
         WHERE workspace_id = $1
         ORDER BY provider ASC
      `,
      [workspaceId],
    );

    return result.rows;
  }

  async getLdapConfig(workspaceId: string): Promise<LdapConfigRecord | null> {
    const result = await this.pool.query<LdapConfigRecord>(
      `
        SELECT status,
               host,
               base_dn,
               metadata,
               last_synced_at
          FROM workspace_ldap_configs
         WHERE workspace_id = $1
         LIMIT 1
      `,
      [workspaceId],
    );

    return result.rows[0] ?? null;
  }

  async listCommunityConnectors(
    workspaceId: string,
  ): Promise<CommunityConnectorRecord[]> {
    const result = await this.pool.query<CommunityConnectorRecord>(
      `
        SELECT name,
               author,
               status,
               metadata,
               created_at
          FROM workspace_community_connectors
         WHERE workspace_id = $1
         ORDER BY created_at DESC
      `,
      [workspaceId],
    );

    return result.rows;
  }
}
