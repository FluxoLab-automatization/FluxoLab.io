import { DatabaseService } from '../../shared/database/database.service';
export interface WebhookRegistration {
    id: string;
    workspaceId: string;
    workflowId: string;
    token: string;
    path: string;
    method: 'GET' | 'POST';
    respondMode: 'immediate' | 'on_last_node' | 'via_node';
    description: string | null;
    enabled: boolean;
    createdAt: Date;
}
export interface WebhookEventRecord {
    id: string;
    workspaceId: string;
    webhookId: string;
    correlationId: string;
    headers: Record<string, unknown>;
    query: Record<string, unknown>;
    body: unknown;
}
export declare class WorkflowWebhookService {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    registerWebhook(params: {
        workspaceId: string;
        workflowId: string;
        token: string;
        path: string;
        method?: 'GET' | 'POST';
        respondMode?: 'immediate' | 'on_last_node' | 'via_node';
        createdBy?: string | null;
        description?: string | null;
    }): Promise<WebhookRegistration>;
    getRegistrationByToken(token: string): Promise<WebhookRegistration>;
    recordEvent(params: {
        workspaceId: string;
        webhookId: string;
        correlationId: string;
        method: string;
        headers: Record<string, unknown>;
        query: Record<string, unknown>;
        body: unknown;
        rawBody?: Buffer | null;
        signature?: string | null;
        idempotencyKey?: string | null;
        status?: 'received' | 'enqueued' | 'processed' | 'failed';
    }): Promise<string>;
    updateEventStatus(eventId: string, status: 'enqueued' | 'processed' | 'failed'): Promise<void>;
    getEvent(eventId: string): Promise<WebhookEventRecord | null>;
    private mapRegistration;
}
