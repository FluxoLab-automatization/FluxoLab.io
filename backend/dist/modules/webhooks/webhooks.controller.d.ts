import type { AuthenticatedUser } from '../auth/auth.types';
import { WebhooksService } from './webhooks.service';
export declare class WebhooksController {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    createWebhook(user: AuthenticatedUser, webhookData: any): Promise<{
        status: string;
        webhook: import("./webhooks.service").WebhookEntity;
    }>;
    listWebhooks(user: AuthenticatedUser, limit?: string, offset?: string): Promise<{
        status: string;
        webhooks: {
            webhooks: import("./webhooks.service").WebhookEntity[];
            total: number;
        };
    }>;
    getWebhook(user: AuthenticatedUser, webhookId: string): Promise<{
        status: string;
        webhook: import("./webhooks.service").WebhookEntity;
    }>;
    updateWebhook(user: AuthenticatedUser, webhookId: string, webhookData: any): Promise<{
        status: string;
        webhook: import("./webhooks.service").WebhookEntity;
    }>;
    deleteWebhook(user: AuthenticatedUser, webhookId: string): Promise<{
        status: string;
        message: string;
    }>;
    testWebhook(user: AuthenticatedUser, webhookId: string, testData: any): Promise<{
        status: string;
        result: {
            success: boolean;
            response: any;
            executionTime: number;
        };
    }>;
    getWebhookLogs(user: AuthenticatedUser, webhookId: string, limit?: string, offset?: string): Promise<{
        status: string;
        logs: {
            logs: import("./webhooks.service").WebhookLog[];
            total: number;
        };
    }>;
    executeWebhook(token: string, payload: any, query: any): Promise<import("./webhooks.service").WebhookExecutionResult>;
}
