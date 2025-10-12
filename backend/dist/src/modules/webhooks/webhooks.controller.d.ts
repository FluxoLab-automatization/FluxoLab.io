import type { Response, Request } from 'express';
import { GenerateWebhookDto } from './dto/generate-webhook.dto';
import { WebhooksService } from './webhooks.service';
interface VerifyQuery {
    'hub.mode'?: string;
    'hub.verify_token'?: string;
    'hub.challenge'?: string;
    [key: string]: string | string[] | undefined;
}
export declare class WebhooksController {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    generateWebhook(payload: GenerateWebhookDto): Promise<{
        status: string;
        message: string;
        token: string;
        webhookUrl: string;
    }>;
    verifyWebhook(token: string, query: VerifyQuery, headers: Record<string, unknown>, res: Response): Promise<void>;
    receiveWebhook(token: string, body: unknown, headers: Record<string, unknown>, req: Request & {
        rawBody?: Buffer;
    }): Promise<{
        status: string;
        message: string;
        eventId: string;
        processing: {
            routeTo: string;
            receivedType: string;
            instruction: string;
            payloadSize: number;
        };
    }>;
}
export {};
