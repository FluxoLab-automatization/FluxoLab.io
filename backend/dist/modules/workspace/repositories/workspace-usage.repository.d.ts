import { DatabaseService } from '../../../shared/database/database.service';
export interface WorkspaceUsageSnapshot {
    workspaceId: string;
    periodStart: string;
    periodEnd: string;
    workflowsActive: number;
    usersActive: number;
    webhookEvents: number;
    collectedAt: string;
    metadata: Record<string, unknown>;
}
export declare class WorkspaceUsageRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    getLatestSnapshot(workspaceId: string): Promise<WorkspaceUsageSnapshot | null>;
}
