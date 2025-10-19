import type { Response, Request } from 'express';
import { GenerateWebhookDto } from './dto/generate-webhook.dto';
import { WebhooksService } from './webhooks.service';
import { WorkflowOrchestratorService } from '../workflows/workflow-orchestrator.service';
interface VerifyQuery {
    'hub.mode'?: string;
    'hub.verify_token'?: string;
    'hub.challenge'?: string;
    [key: string]: string | string[] | undefined;
}
export declare class WebhooksController {
    private readonly webhooksService;
    private readonly orchestrator;
    constructor(webhooksService: WebhooksService, orchestrator: WorkflowOrchestratorService);
    generateWebhook(payload: GenerateWebhookDto): Promise<{
        status: string;
        message: string;
        token: string;
        webhookUrl: string;
        registrationId: string;
    }>;
    verifyWebhook(token: string, query: VerifyQuery, headers: Record<string, unknown>, res: Response): Promise<void>;
    receiveWebhook(token: string, body: unknown, headers: Record<string, unknown>, req: Request & {
        rawBody?: Buffer;
    }, res: Response): Promise<void>;
}
export {};
