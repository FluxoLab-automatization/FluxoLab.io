import { Module } from '@nestjs/common';
import { MonitoringModule } from '../monitoring/monitoring.module';
import { WorkflowsService } from './workflows.service';
import { WorkflowCredentialsService } from './workflow-credentials.service';
import { WorkflowExecutionsService } from './workflow-executions.service';
import { WorkflowWebhookService } from './workflow-webhook.service';
import { WorkflowResponseRegistry } from './workflow-response.registry';
import { WorkflowQueueService } from './workflow-queue.service';
import { WorkflowEngineService } from './workflow-engine.service';
import { WorkflowRunnerService } from './workflow-runner.service';
import { WorkflowOrchestratorService } from './workflow-orchestrator.service';
import { WorkflowsController } from './workflows.controller';
import { WorkflowCredentialsController } from './workflow-credentials.controller';

@Module({
  imports: [MonitoringModule],
  controllers: [WorkflowsController, WorkflowCredentialsController],
  providers: [
    WorkflowsService,
    WorkflowCredentialsService,
    WorkflowExecutionsService,
    WorkflowWebhookService,
    WorkflowResponseRegistry,
    WorkflowQueueService,
    WorkflowEngineService,
    WorkflowRunnerService,
    WorkflowOrchestratorService,
  ],
  exports: [
    WorkflowsService,
    WorkflowCredentialsService,
    WorkflowExecutionsService,
    WorkflowWebhookService,
    WorkflowResponseRegistry,
    WorkflowQueueService,
    WorkflowEngineService,
    WorkflowRunnerService,
    WorkflowOrchestratorService,
  ],
})
export class WorkflowsModule {}
