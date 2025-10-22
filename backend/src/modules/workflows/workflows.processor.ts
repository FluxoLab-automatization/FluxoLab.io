import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { AppConfig } from '../../config/env.validation';

@Processor('workflows')
export class WorkflowsProcessor {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  @Process('lead.captured')
  async handleLeadCaptured(job: Job) {
    console.log('--- Workflow Processor ---');
    console.log('Processing job:', job.id);
    console.log('Job Name:', job.name);
    console.log('Lead Payload:', JSON.stringify(job.data.payload, null, 2));

    const payloadPhone = job.data.payload?.phone as string | undefined;
    const fallbackPhone =
      this.config.get('WHATSAPP_LEAD_ALERT_PHONE', { infer: true }) ?? null;
    const targetPhone = this.normalizePhone(payloadPhone ?? fallbackPhone);

    if (targetPhone) {
      const leadName = job.data.payload?.name || 'N/A';
      const message = `Ola! Recebemos seu contato. Em breve um de nossos especialistas falara com voce. Lead: ${leadName}`;
      await this.whatsappService.sendMessage(targetPhone, message);
    } else {
      console.warn(
        'Lead captured job does not contain a valid phone and no fallback was configured.',
      );
    }

    console.log('--- End of Job ---');
  }

  private normalizePhone(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }
    const digits = value.replace(/\D+/g, '');
    if (digits.length < 10) {
      return null;
    }
    return digits;
  }
}
