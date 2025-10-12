import { DatabaseService } from '../../../shared/database/database.service';
export interface ConversationRecord {
    id: string;
    owner_id: string;
    title: string;
    status: string;
    metadata: Record<string, unknown> | null;
    created_at: Date;
    updated_at: Date;
}
export declare class ConversationsRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    listRecentByOwner(ownerId: string, limit: number): Promise<ConversationRecord[]>;
    countByOwner(ownerId: string): Promise<number>;
}
