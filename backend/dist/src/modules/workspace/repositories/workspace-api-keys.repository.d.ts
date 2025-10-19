import { DatabaseService } from '../../../shared/database/database.service';
export interface WorkspaceApiKeyRecord {
    id: string;
    workspace_id: string;
    label: string;
    key_hash?: string;
    key_preview: string;
    scopes: string[];
    status: 'active' | 'revoked' | 'expired';
    created_by: string | null;
    created_by_email: string | null;
    metadata: Record<string, unknown> | null;
    last_used_at: Date | null;
    expires_at: Date | null;
    revoked_at: Date | null;
    created_at: Date;
    updated_at: Date;
}
export declare class WorkspaceApiKeysRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    listActive(workspaceId: string): Promise<WorkspaceApiKeyRecord[]>;
    findById(workspaceId: string, apiKeyId: string): Promise<WorkspaceApiKeyRecord | null>;
    createKey(params: {
        workspaceId: string;
        label: string;
        keyHash: string;
        keyPreview: string;
        scopes: string[];
        createdBy?: string | null;
        metadata?: Record<string, unknown>;
        expiresAt?: Date | null;
    }): Promise<WorkspaceApiKeyRecord>;
    revokeKey(workspaceId: string, apiKeyId: string): Promise<void>;
    updateKeySecret(params: {
        workspaceId: string;
        apiKeyId: string;
        keyHash: string;
        keyPreview: string;
        metadata?: Record<string, unknown>;
    }): Promise<void>;
}
