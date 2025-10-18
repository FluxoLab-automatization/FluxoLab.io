import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Worker } from 'bullmq';
import { DeliverPayload, WorkflowQueueService } from './workflow-queue.service';
import { WorkflowExecutionsService } from './workflow-executions.service';
import { WorkflowWebhookService } from './workflow-webhook.service';
import { WorkflowEngineService } from './workflow-engine.service';
import { WorkflowItem } from './engine/types';

@Injectable()
export class WorkflowRunnerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkflowRunnerService.name);
  private worker?: Worker<DeliverPayload>;

  constructor(
    private readonly queueService: WorkflowQueueService,
    private readonly executionsService: WorkflowExecutionsService,
    private readonly webhookService: WorkflowWebhookService,
    private readonly engine: WorkflowEngineService,
  ) {}

  async onModuleInit(): Promise<void> {
    const queue = this.queueService.getQueue();
    this.worker = new Worker<DeliverPayload>(
      queue.name,
      async (job) => {
        const { executionId, workspaceId } = job.data;
        const execution = await this.executionsService.getExecution(executionId);
        if (!execution) {
          this.logger.warn(`Execution ${executionId} not found`);
          return;
        }

        const event = execution.triggerEventId
          ? await this.webhookService.getEvent(execution.triggerEventId)
          : null;

        const items: WorkflowItem[] = [
          {
            json: {
              ...(event?.query ?? {}),
              ...(event?.body ?? {}),
            },
          },
        ];

        await this.engine.runInline({
          workspaceId,
          workflowId: execution.workflowId,
          executionId,
          correlationId: execution.correlationId,
          initialItems: items,
        });

        if (execution.triggerEventId) {
          await this.webhookService.updateEventStatus(execution.triggerEventId, 'processed');
        }
      },
      {
        connection: this.queueService.getConnection(),
      },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Workflow job ${job?.id ?? 'unknown'} failed`, err instanceof Error ? err.stack : err);
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
    }
  }
}
