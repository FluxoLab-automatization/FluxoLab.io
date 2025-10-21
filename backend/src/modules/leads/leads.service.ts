import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class LeadsService {
  constructor(@InjectQueue('workflows') private readonly workflowsQueue: Queue) {}

  async captureLead(payload: Record<string, any>) {
    console.log(`Capturing lead: ${JSON.stringify(payload)}`);

    // Adiciona um job à fila 'workflows' com o nome 'lead.captured'
    await this.workflowsQueue.add('lead.captured', {
      payload,
    });
  }
}
