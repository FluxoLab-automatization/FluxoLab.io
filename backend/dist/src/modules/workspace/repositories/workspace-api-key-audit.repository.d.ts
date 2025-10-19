import { DatabaseService } from '../../../shared/database/database.service';
export interface WorkspaceApiKeyAuditRecord {
    id: string;
    api_key_id: string;
    workspace_id: string;
    action: 'created' | 'rotated' | 'revoked' | 'used';
    actor_id: string | null;
    ip_address: string | null;
    user_agent: string | null;
    metadata: Record<string, unknown>;
    occurred_at: Date;
}
export declare class WorkspaceApiKeyAuditRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    recordEvent(params: {
        apiKeyId: string;
        workspaceId: string;
        action: 'created' | 'rotated' | 'revoked' | 'used';
        actorId?: string | null;
        ipAddress?: string | null;
        userAgent?: string | null;
        metadata?: Record<string, unknown>;
    }): Promise<void>;
    listRecent(workspaceId: string, apiKeyId: string, limit?: number): Promise<WorkspaceApiKeyAuditRecord[]>;
}
