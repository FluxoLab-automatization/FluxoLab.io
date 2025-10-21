import type { Job } from 'bull';
import { WhatsappService } from '../whatsapp/whatsapp.service';
export declare class WorkflowsProcessor {
    private readonly whatsappService;
    constructor(whatsappService: WhatsappService);
    handleLeadCaptured(job: Job): Promise<void>;
}
