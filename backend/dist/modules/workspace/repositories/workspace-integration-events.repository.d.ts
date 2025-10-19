import { DatabaseService } from '../../../shared/database/database.service';
export interface WorkspaceIntegrationEventRecord {
    id: string;
    workspace_id: string;
    integration_type: string;
    integration_id: string | null;
    status: string;
    payload: Record<string, unknown>;
    recorded_by: string | null;
    occurred_at: Date;
}
export declare class WorkspaceIntegrationEventsRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    recordEvent(params: {
        workspaceId: string;
        integrationType: string;
        integrationId?: string | null;
        status: string;
        payload?: Record<string, unknown>;
        recordedBy?: string | null;
    }): Promise<void>;
    listRecent(workspaceId: string, limit?: number): Promise<WorkspaceIntegrationEventRecord[]>;
}
