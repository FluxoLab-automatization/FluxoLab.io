import { DatabaseService } from '../../../shared/database/database.service';
export interface WebhookEventInsert {
    registrationId: string;
    eventType: string | null;
    payload: unknown;
    headers: Record<string, unknown> | null;
    signatureValid: boolean;
    status: 'received' | 'processed' | 'rejected' | 'error';
    errorMessage?: string | null;
}
export interface WebhookEventRecord {
    id: string;
    registration_id: string;
    event_type: string | null;
    status: string;
    signature_valid: boolean;
    error_message: string | null;
    received_at: Date;
}
export declare class WebhookEventsRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    recordEvent(params: WebhookEventInsert): Promise<WebhookEventRecord>;
}
