import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MonitoringModule } from '../monitoring/monitoring.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { WorkflowsService } from './workflows.service';
import { WorkflowCredentialsService } from './workflow-credentials.service';
import { WorkflowExecutionsService } from './workflow-executions.service';
import { WorkflowWebhookService } from './workflow-webhook.service';
import { WorkflowResponseRegistry } from './workflow-response.registry';
import { WorkflowEngineService } from './workflow-engine.service';
import { WorkflowRunnerService } from './workflow-runner.service';
import { WorkflowOrchestratorService } from './workflow-orchestrator.service';
import { WorkflowsController } from './workflows.controller';
import { WorkflowCredentialsController } from './workflow-credentials.controller';

import { WorkflowsProcessor } from './workflows.processor';
import { WorkflowQueueService } from './workflow-queue.service';

@Module({
  imports: [
    MonitoringModule,
    WhatsappModule,
    BullModule.registerQueue({ name: 'workflows' }),
  ],
  controllers: [WorkflowsController, WorkflowCredentialsController],
  providers: [
    WorkflowsService,
    WorkflowCredentialsService,
    WorkflowExecutionsService,
    WorkflowWebhookService,
    WorkflowResponseRegistry,
    WorkflowEngineService,
    WorkflowRunnerService,
    WorkflowOrchestratorService,
    WorkflowQueueService,
    WorkflowsProcessor,
  ],
  exports: [
    WorkflowsService,
    WorkflowCredentialsService,
    WorkflowExecutionsService,
    WorkflowWebhookService,
    WorkflowResponseRegistry,
    WorkflowEngineService,
    WorkflowRunnerService,
    WorkflowOrchestratorService,
    WorkflowQueueService,
  ],
})
export class WorkflowsModule {}
