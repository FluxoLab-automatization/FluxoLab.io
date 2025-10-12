import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import type { AppConfig } from '../../config/env.validation';
import { SecurityService } from '../../shared/security/security.service';
import { GenerateWebhookDto } from './dto/generate-webhook.dto';
import { WebhookRegistrationsRepository } from './repositories/webhook-registrations.repository';
import { WebhookEventsRepository } from './repositories/webhook-events.repository';
interface VerifyQuery {
    'hub.mode'?: string;
    'hub.verify_token'?: string;
    'hub.challenge'?: string;
    [key: string]: string | string[] | undefined;
}
export declare class WebhooksService {
    private readonly registrationsRepository;
    private readonly eventsRepository;
    private readonly securityService;
    private readonly config;
    private readonly logger;
    private readonly baseUrl;
    private readonly receivingBasePath;
    private readonly verifyToken;
    private readonly appSecret;
    constructor(registrationsRepository: WebhookRegistrationsRepository, eventsRepository: WebhookEventsRepository, securityService: SecurityService, config: ConfigService<AppConfig, true>, logger: PinoLogger);
    generateWebhook(dto: GenerateWebhookDto): Promise<{
        status: string;
        message: string;
        token: string;
        webhookUrl: string;
    }>;
    verifyWebhook(token: string, query: VerifyQuery, headers: Record<string, unknown>): Promise<string>;
    receiveWebhook(token: string, body: unknown, headers: Record<string, unknown>, rawBody: Buffer | undefined): Promise<{
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
    private requireRegistration;
    private verifyMetaSignature;
    private processEvent;
    private extractEventType;
    private headerSnapshot;
}
export {};
