import { DatabaseService } from '../../../shared/database/database.service';
export interface EnvironmentRecord {
    id: string;
    workspace_id: string;
    name: string;
    slug: string;
    environment_type: 'sandbox' | 'staging' | 'production' | 'custom';
    region: string | null;
    status: 'pending' | 'ready' | 'locked' | 'disabled';
    metadata: Record<string, unknown> | null;
    last_synced_at: Date | null;
    created_at: Date;
    updated_at: Date;
}
export declare class WorkspaceEnvironmentsRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    ensureDefaultEnvironments(workspaceId: string): Promise<void>;
    listByWorkspace(workspaceId: string): Promise<EnvironmentRecord[]>;
    updateStatus(params: {
        workspaceId: string;
        environmentId: string;
        status: EnvironmentRecord['status'];
    }): Promise<EnvironmentRecord | null>;
}
