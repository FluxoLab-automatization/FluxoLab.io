import { Injectable, Logger } from '@nestjs/common';
import { WorkflowsService, WorkflowVersionEntity } from './workflows.service';
import { WorkflowCredentialsService } from './workflow-credentials.service';
import { WorkflowExecutionsService } from './workflow-executions.service';
import { WorkflowResponseRegistry } from './workflow-response.registry';
import { resolveNodeHandler } from './engine/node-registry';
import {
  WorkflowItem,
  WorkflowNodeDefinition,
  WorkflowRuntimeContext,
} from './engine/types';
import { WorkflowWebhookService } from './workflow-webhook.service';
import { WorkflowQueueService } from './workflow-queue.service';

interface ExecuteOptions {
  workspaceId: string;
  workflowId: string;
  executionId: string;
  correlationId?: string | null;
  initialItems: WorkflowItem[];
}

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(
    private readonly workflowsService: WorkflowsService,
    private readonly credentialsService: WorkflowCredentialsService,
    private readonly executionsService: WorkflowExecutionsService,
    private readonly responseRegistry: WorkflowResponseRegistry,
    private readonly webhookService: WorkflowWebhookService,
    private readonly queueService: WorkflowQueueService,
  ) {}

  async enqueueExecution(executionId: string, workspaceId: string): Promise<void> {
    await this.queueService.enqueueDeliver({ executionId, workspaceId });
  }

  /**
   * Execute workflow synchronously (used for MVP and tests).
   */
  async runInline(options: ExecuteOptions): Promise<void> {
    const version = await this.workflowsService.getActiveVersion(
      options.workspaceId,
      options.workflowId,
    );

    await this.executionsService.markRunning(options.executionId);
    try {
      await this.executeDefinition(version, options);
      await this.executionsService.markFinished(options.executionId, 'succeeded');
    } catch (error) {
      this.logger.error('Workflow execution failed', error instanceof Error ? error.stack : undefined);
      await this.executionsService.markFinished(options.executionId, 'failed', {
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private async executeDefinition(version: WorkflowVersionEntity, options: ExecuteOptions): Promise<void> {
    const { definition } = version;
    const nodes = new Map<string, WorkflowNodeDefinition>(
      (definition.nodes ?? []).map((node) => {
        const normalized: WorkflowNodeDefinition = {
          id: String(node.id),
          type: node.type,
          name: node.name,
          params: node.params ?? {},
        };
        return [normalized.id, normalized];
      }),
    );
    const connections = (definition.connections ?? []).map((conn) => ({
      from: String(conn.from),
      to: String(conn.to),
      output: conn.output ? String(conn.output) : 'default',
    }));

    const queue: string[] = [];
    const itemsByNode = new Map<string, WorkflowItem[]>();

    const startNodes = this.resolveStartNodes(nodes, connections);
    if (startNodes.length === 0) {
      return;
    }

    // initial items propagate to first node after trigger
    itemsByNode.set(startNodes[0], options.initialItems);
    queue.push(startNodes[0]);

    while (queue.length > 0) {
      const nodeId = queue.shift() as string;
      const node = nodes.get(nodeId);
      if (!node) {
        continue;
      }

      const handler = resolveNodeHandler(node.type);
      if (!handler) {
        this.logger.warn(`No handler registered for node type ${node.type}`);
        continue;
      }

      const items = itemsByNode.get(nodeId) ?? [];
      if (!items.length) {
        continue;
      }

      await this.executionsService.appendStep({
        executionId: options.executionId,
        nodeId,
        nodeName: node.name ?? node.type,
        status: 'running',
        attempt: 1,
        inputItems: items,
      });

      const ctx: WorkflowRuntimeContext & {
        params: Record<string, unknown>;
        getCredential: <T = Record<string, unknown>>(id: string) => Promise<T>;
        log: (message: string, metadata?: Record<string, unknown>) => void;
        respond?: (status: number, payload: unknown) => Promise<void>;
      } = {
        workspaceId: options.workspaceId,
        workflowId: options.workflowId,
        executionId: options.executionId,
        correlationId: options.correlationId ?? null,
        params: node.params ?? {},
        getCredential: async <T = Record<string, unknown>>(id: string) => {
          const credential = await this.credentialsService.getCredential(options.workspaceId, id);
          if (!credential) {
            throw new Error(`Credential ${id} not found for workspace ${options.workspaceId}`);
          }
          return credential.secret as T;
        },
        log: (message, metadata) =>
          this.logger.debug({
            executionId: options.executionId,
            nodeId,
            message,
            metadata,
          }),
        respond:
          options.correlationId && node.type === 'webhook.respond'
            ? async (status, payload) => {
                const responder = this.responseRegistry.consume(options.correlationId as string);
                if (responder) {
                  responder.resolve(status, payload);
                } else {
                  this.logger.warn(`No pending HTTP responder for correlation ${options.correlationId}`);
                }
              }
            : undefined,
      };

      const result = await handler.execute(node, items, ctx);
      await this.executionsService.appendStep({
        executionId: options.executionId,
        nodeId,
        nodeName: node.name ?? node.type,
        status: 'succeeded',
        attempt: 1,
        inputItems: items,
        outputItems: result.itemsByOutput,
      });

      const outgoing = connections.filter((conn) => conn.from === nodeId);
      for (const connection of outgoing) {
        const nextItems =
          result.itemsByOutput[connection.output ?? 'default'] ??
          result.itemsByOutput.default ??
          [];
        if (!nextItems.length) {
          continue;
        }
        const existing = itemsByNode.get(connection.to) ?? [];
        itemsByNode.set(connection.to, existing.concat(nextItems));
        if (!queue.includes(connection.to)) {
          queue.push(connection.to);
        }
      }
    }
  }

  private resolveStartNodes(
    nodes: Map<string, WorkflowNodeDefinition>,
    connections: WorkflowConnectionDefinition[],
  ): string[] {
    const hasIncoming = new Map<string, boolean>();
    for (const nodeId of nodes.keys()) {
      hasIncoming.set(nodeId, false);
    }

    for (const connection of connections) {
      hasIncoming.set(connection.to, true);
    }

    const start = Array.from(nodes.keys()).filter((nodeId) => !hasIncoming.get(nodeId));
    if (start.length === 0) {
      // fallback to first defined node
      const first = nodes.keys().next().value;
      return first ? [first] : [];
    }
    return start;
  }
}
