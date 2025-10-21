import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Processor('workflows')
export class WorkflowsProcessor {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Process('lead.captured')
  async handleLeadCaptured(job: Job) {
    console.log('--- Workflow Processor ---');
    console.log('Processing job:', job.id);
    console.log('Job Name:', job.name);
    console.log('Lead Payload:', JSON.stringify(job.data.payload, null, 2));

    // Extrai o telefone do payload do lead (ajuste conforme sua estrutura de dados)
    const phone = job.data.payload?.phone;

    if (phone) {
      const message = `Olá! Recebemos seu contato. Em breve um de nossos especialistas falará com você. Lead: ${job.data.payload?.name || 'N/A'}`;
      // ATENÇÃO: Substitua '5531999999999' pelo número de telefone para onde a notificação deve ser enviada
      await this.whatsappService.sendMessage('553199999-9999', message);
    } else {
      console.warn('Job payload does not contain a phone number. Cannot send WhatsApp message.');
    }

    console.log('--- End of Job ---');
  }
}
