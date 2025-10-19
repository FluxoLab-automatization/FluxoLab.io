import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { WorkflowWebhookService } from './workflow-webhook.service';
import { WorkflowExecutionsService } from './workflow-executions.service';
import { WorkflowsService } from './workflows.service';
import { WorkflowEngineService } from './workflow-engine.service';
import { WorkflowResponseRegistry } from './workflow-response.registry';
import { MetricsService } from '../monitoring/metrics.service';

interface TriggerPayload {
  token: string;
  method: string;
  headers: Record<string, unknown>;
  query: Record<string, unknown>;
  body: unknown;
  rawBody?: Buffer | null;
  idempotencyKey?: string | null;
  respond?: (status: number, payload: unknown) => void;
}

@Injectable()
export class WorkflowOrchestratorService {
  private readonly logger = new Logger(WorkflowOrchestratorService.name);

  constructor(
    private readonly webhookService: WorkflowWebhookService,
    private readonly executionsService: WorkflowExecutionsService,
    private readonly workflowsService: WorkflowsService,
    private readonly engine: WorkflowEngineService,
    private readonly responseRegistry: WorkflowResponseRegistry,
    private readonly metrics: MetricsService,
  ) {}

  async triggerViaWebhook(payload: TriggerPayload): Promise<{ executionId: string }> {
    const registration = await this.webhookService.getRegistrationByToken(payload.token);
    const correlationId = randomUUID();

    const eventId = await this.webhookService.recordEvent({
      workspaceId: registration.workspaceId,
      webhookId: registration.id,
      correlationId,
      method: payload.method,
      headers: payload.headers,
      query: payload.query,
      body: payload.body,
      rawBody: payload.rawBody ?? null,
      signature: null,
      idempotencyKey: payload.idempotencyKey ?? null,
      status: 'received',
    });

    const version = await this.workflowsService.getActiveVersion(
      registration.workspaceId,
      registration.workflowId,
    );

    const execution = await this.executionsService.createExecution({
      workspaceId: registration.workspaceId,
      workflowId: registration.workflowId,
      workflowVersionId: version.id,
      triggerEventId: eventId,
      correlationId,
    });

    this.metrics.incrementCounter('workflow_triggers_total', {
      trigger_type: 'webhook',
      workflow_id: registration.workflowId,
      workspace_id: registration.workspaceId,
    });

    if (registration.respondMode === 'immediate' && payload.respond) {
      payload.respond(202, {
        status: 'accepted',
        executionId: execution.id,
      });
    }

    if (registration.respondMode === 'via_node' && payload.respond) {
      this.responseRegistry.register(correlationId, {
        resolve: (status, body) => payload.respond?.(status, body),
        reject: (err) => {
          this.logger.error('Failed to respond to webhook', err);
          payload.respond?.(500, { status: 'error', message: 'Internal error' });
        },
      });
    }

    const startedAt = Date.now();
    try {
      // MVP: run inline for immediate feedback; queue support can be toggled later.
      await this.engine.runInline({
        workspaceId: registration.workspaceId,
        workflowId: registration.workflowId,
        executionId: execution.id,
        correlationId,
        initialItems: [
          {
            json: {
              ...(payload.query ?? {}),
              ...(payload.body as Record<string, unknown> | undefined ?? {}),
            },
          },
        ],
      });

      try {
        await this.webhookService.updateEventStatus(eventId, 'processed');
      } catch (updateError) {
        this.logger.error(
          'Failed to update webhook event status after workflow success',
          updateError,
        );
      }

      const durationSeconds = (Date.now() - startedAt) / 1000;
      this.metrics.incrementCounter('workflow_executions_total', {
        trigger_type: 'webhook',
        workflow_id: registration.workflowId,
        workspace_id: registration.workspaceId,
        status: 'succeeded',
      });
      this.metrics.recordHistogram('workflow_execution_duration_seconds', durationSeconds, {
        trigger_type: 'webhook',
        workflow_id: registration.workflowId,
      });
    } catch (error) {
      this.metrics.incrementCounter('workflow_executions_total', {
        trigger_type: 'webhook',
        workflow_id: registration.workflowId,
        workspace_id: registration.workspaceId,
        status: 'failed',
      });
      try {
        await this.webhookService.updateEventStatus(eventId, 'failed');
      } catch (updateError) {
        this.logger.error(
          'Failed to update webhook event status after workflow error',
          updateError,
        );
      }
      this.metrics.recordError('workflow_execution_failed', 'workflows');
      throw error;
    }

    if (registration.respondMode === 'on_last_node' && payload.respond) {
      payload.respond(200, {
        status: 'completed',
        executionId: execution.id,
      });
    }

    return { executionId: execution.id };
  }
}
