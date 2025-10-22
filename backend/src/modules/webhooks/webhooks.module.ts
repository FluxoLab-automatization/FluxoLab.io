import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WorkflowsModule } from '../workflows/workflows.module';
import { DatabaseModule } from '../../shared/database/database.module';

@Module({
  imports: [WorkflowsModule, DatabaseModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
