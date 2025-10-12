import { DatabaseService } from '../../../shared/database/database.service';
export interface ActivityRecord {
    id: string;
    user_id: string | null;
    entity_type: string;
    entity_id: string | null;
    action: string;
    payload: Record<string, unknown> | null;
    created_at: Date;
}
export declare class ActivitiesRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    listRecentByUser(userId: string, limit: number): Promise<ActivityRecord[]>;
}
