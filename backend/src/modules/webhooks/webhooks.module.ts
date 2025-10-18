import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WebhookRegistrationsRepository } from './repositories/webhook-registrations.repository';
import { WebhookEventsRepository } from './repositories/webhook-events.repository';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [WorkflowsModule],
  controllers: [WebhooksController],
  providers: [
    WebhooksService,
    WebhookRegistrationsRepository,
    WebhookEventsRepository,
  ],
  exports: [WebhooksService],
})
export class WebhooksModule {}
