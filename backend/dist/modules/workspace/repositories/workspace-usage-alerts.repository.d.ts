import { DatabaseService } from '../../../shared/database/database.service';
export interface WorkspaceUsageAlertRecord {
    id: string;
    workspace_id: string;
    metric: string;
    threshold: number;
    condition: string;
    window: string;
    channel: string;
    enabled: boolean;
    created_by: string | null;
    metadata: Record<string, unknown>;
    last_triggered_at: Date | null;
    created_at: Date;
    updated_at: Date;
}
export declare class WorkspaceUsageAlertsRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    listByWorkspace(workspaceId: string): Promise<WorkspaceUsageAlertRecord[]>;
    createAlert(params: {
        workspaceId: string;
        metric: string;
        threshold: number;
        condition: string;
        window?: string;
        channel?: string;
        createdBy?: string | null;
        metadata?: Record<string, unknown>;
    }): Promise<WorkspaceUsageAlertRecord>;
    setEnabled(alertId: string, enabled: boolean): Promise<void>;
    deleteAlert(alertId: string): Promise<void>;
    touchTriggered(alertId: string): Promise<void>;
}
