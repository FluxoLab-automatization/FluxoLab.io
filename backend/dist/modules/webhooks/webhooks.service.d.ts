import { DatabaseService } from '../../shared/database/database.service';
export interface WebhookEntity {
    id: string;
    workspaceId: string;
    name: string;
    path: string;
    method: string;
    authentication: 'none' | 'basic' | 'bearer' | 'api-key';
    respondMode: 'immediately' | 'when_complete' | 'never';
    workflowId: string | null;
    isActive: boolean;
    token: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface WebhookLog {
    id: string;
    webhookId: string;
    method: string;
    path: string;
    headers: Record<string, string>;
    query: Record<string, string>;
    payload: any;
    responseStatus: number;
    responseBody: any;
    executionTime: number;
    createdAt: Date;
}
export interface WebhookExecutionResult {
    success: boolean;
    status: number;
    body: any;
    executionId?: string;
    error?: string;
}
export declare class WebhooksService {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    createWebhook(workspaceId: string, webhookData: {
        name: string;
        path: string;
        method: string;
        authentication: string;
        respondMode: string;
        workflowId?: string;
        createdBy: string;
    }): Promise<WebhookEntity>;
    listWebhooks(workspaceId: string, options: {
        limit: number;
        offset: number;
    }): Promise<{
        webhooks: WebhookEntity[];
        total: number;
    }>;
    getWebhook(workspaceId: string, webhookId: string): Promise<WebhookEntity>;
    updateWebhook(workspaceId: string, webhookId: string, updates: Partial<{
        name: string;
        path: string;
        method: string;
        authentication: string;
        respondMode: string;
        workflowId: string;
        isActive: boolean;
    }>): Promise<WebhookEntity>;
    deleteWebhook(workspaceId: string, webhookId: string): Promise<void>;
    testWebhook(workspaceId: string, webhookId: string, testData: any): Promise<{
        success: boolean;
        response: any;
        executionTime: number;
    }>;
    executeWebhook(token: string, requestData: {
        payload: any;
        query: any;
        headers: Record<string, string>;
        method: string;
    }): Promise<WebhookExecutionResult>;
    getWebhookLogs(workspaceId: string, webhookId: string, options: {
        limit: number;
        offset: number;
    }): Promise<{
        logs: WebhookLog[];
        total: number;
    }>;
    private logWebhookExecution;
    private generateWebhookToken;
    private mapWebhook;
}
