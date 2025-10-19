import { SecurityService } from '../../../shared/security/security.service';
import { WorkspaceApiKeysRepository } from '../repositories/workspace-api-keys.repository';
import { WorkspaceApiKeyAuditRepository } from '../repositories/workspace-api-key-audit.repository';
import { WorkspaceIntegrationEventsRepository } from '../repositories/workspace-integration-events.repository';
export interface ApiKeySummary {
    id: string;
    label: string;
    status: string;
    keyPreview: string;
    scopes: string[];
    createdBy: string | null;
    createdAt: Date;
    expiresAt: Date | null;
    revokedAt: Date | null;
    metadata: Record<string, unknown>;
}
export declare class WorkspaceApiKeysService {
    private readonly apiKeysRepository;
    private readonly auditRepository;
    private readonly integrationEvents;
    private readonly securityService;
    constructor(apiKeysRepository: WorkspaceApiKeysRepository, auditRepository: WorkspaceApiKeyAuditRepository, integrationEvents: WorkspaceIntegrationEventsRepository, securityService: SecurityService);
    listKeys(workspaceId: string): Promise<ApiKeySummary[]>;
    createKey(params: {
        workspaceId: string;
        label: string;
        scopes: string[];
        createdBy?: string | null;
        expiresAt?: Date | null;
        metadata?: Record<string, unknown>;
    }): Promise<{
        token: string;
        key: ApiKeySummary;
    }>;
    revokeKey(params: {
        workspaceId: string;
        apiKeyId: string;
        actorId?: string | null;
    }): Promise<void>;
    rotateKey(params: {
        workspaceId: string;
        apiKeyId: string;
        actorId?: string | null;
    }): Promise<{
        token: string;
    }>;
    getKeyUsage(workspaceId: string, apiKeyId: string, limit?: number): Promise<import("../repositories/workspace-api-key-audit.repository").WorkspaceApiKeyAuditRecord[]>;
    private generateToken;
    private buildPreview;
    private mapRecord;
}
