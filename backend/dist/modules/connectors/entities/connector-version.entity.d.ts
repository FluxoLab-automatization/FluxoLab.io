export declare class ConnectorVersion {
    id: string;
    connectorId: string;
    version: string;
    isActive: boolean;
    changelog: string;
    configSchema: Record<string, any>;
    authSchema: Record<string, any>;
    created_at: Date;
}
