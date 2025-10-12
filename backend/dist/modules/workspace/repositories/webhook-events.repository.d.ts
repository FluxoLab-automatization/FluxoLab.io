import { DatabaseService } from '../../../shared/database/database.service';
export interface WebhookEventRecord {
    id: string;
    registration_id: string;
    event_type: string | null;
    status: string;
    signature_valid: boolean;
    received_at: Date;
}
export declare class WorkspaceWebhookRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    countRegistrations(): Promise<number>;
    countEvents(): Promise<number>;
    listRecentEvents(limit: number): Promise<WebhookEventRecord[]>;
}
