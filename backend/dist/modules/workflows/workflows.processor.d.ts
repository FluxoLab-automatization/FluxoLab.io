import type { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { AppConfig } from '../../config/env.validation';
export declare class WorkflowsProcessor {
    private readonly whatsappService;
    private readonly config;
    constructor(whatsappService: WhatsappService, config: ConfigService<AppConfig, true>);
    handleLeadCaptured(job: Job): Promise<void>;
    private normalizePhone;
}
