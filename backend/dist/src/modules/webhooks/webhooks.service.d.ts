import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import type { AppConfig } from '../../config/env.validation';
import { SecurityService } from '../../shared/security/security.service';
import { GenerateWebhookDto } from './dto/generate-webhook.dto';
import { WorkflowWebhookService } from '../workflows/workflow-webhook.service';
interface VerifyQuery {
    'hub.mode'?: string;
    'hub.verify_token'?: string;
    'hub.challenge'?: string;
    [key: string]: string | string[] | undefined;
}
export declare class WebhooksService {
    private readonly webhookService;
    private readonly securityService;
    private readonly config;
    private readonly logger;
    private readonly baseUrl;
    private readonly receivingBasePath;
    private readonly verifyToken;
    private readonly appSecret;
    constructor(webhookService: WorkflowWebhookService, securityService: SecurityService, config: ConfigService<AppConfig, true>, logger: PinoLogger);
    generateWebhook(dto: GenerateWebhookDto): Promise<{
        status: string;
        message: string;
        token: string;
        webhookUrl: string;
        registrationId: string;
    }>;
    verifyWebhook(token: string, query: VerifyQuery, headers: Record<string, unknown>): Promise<string>;
    receiveWebhook(token: string, method: string, query: Record<string, unknown>, body: unknown, headers: Record<string, unknown>, rawBody: Buffer | undefined): Promise<{
        status: string;
        message: string;
        eventId: string;
        processing: {
            routeTo: string;
            workspaceId: string;
            receivedType: string;
            respondMode: "immediate" | "on_last_node" | "via_node";
            instruction: string;
            payloadSize: number;
        };
    }>;
    private requireRegistration;
    private verifyMetaSignature;
    private buildProcessingSummary;
    private extractEventType;
    private normalizeQuery;
    private extractSignatureHeader;
    private normalizeRelativePath;
    private buildRoutePath;
    private headerSnapshot;
}
export {};
