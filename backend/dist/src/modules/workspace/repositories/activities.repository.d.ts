import { DatabaseService } from '../../../shared/database/database.service';
export interface ActivityRecord {
    id: string;
    workspace_id: string;
    user_id: string | null;
    entity_type: string;
    entity_id: string | null;
    action: string;
    metadata: Record<string, unknown> | null;
    created_at: Date;
}
export declare class ActivitiesRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    listRecentByUser(workspaceId: string, userId: string, limit: number): Promise<ActivityRecord[]>;
}
