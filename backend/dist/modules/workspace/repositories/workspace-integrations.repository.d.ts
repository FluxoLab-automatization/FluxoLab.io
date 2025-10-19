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
export declare class WorkspaceIntegrationsRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    seedPlaceholders(workspaceId: string): Promise<void>;
    listSecretProviders(workspaceId: string): Promise<SecretProviderRecord[]>;
    listLogDestinations(workspaceId: string): Promise<LogDestinationRecord[]>;
    listSsoConfigs(workspaceId: string): Promise<SsoConfigRecord[]>;
    getLdapConfig(workspaceId: string): Promise<LdapConfigRecord | null>;
    listCommunityConnectors(workspaceId: string): Promise<CommunityConnectorRecord[]>;
    upsertSsoConfig(params: {
        workspaceId: string;
        provider: string;
        status: string;
        settings?: Record<string, unknown>;
        metadata?: Record<string, unknown>;
    }): Promise<void>;
    upsertLdapConfig(params: {
        workspaceId: string;
        status: string;
        host?: string | null;
        baseDn?: string | null;
        settings?: Record<string, unknown>;
        metadata?: Record<string, unknown>;
    }): Promise<void>;
    upsertLogDestination(params: {
        workspaceId: string;
        destination: string;
        status: string;
        config?: Record<string, unknown>;
        metadata?: Record<string, unknown>;
    }): Promise<void>;
}
