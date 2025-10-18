import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { WorkflowEngineService } from '../workflow-engine.service';
import type { WorkflowDefinition, WorkflowVersionEntity } from '../workflows.service';

describe('WorkflowEngineService', () => {
  const workflowsService = {
    getActiveVersion: jest.fn(),
  } as Partial<{ getActiveVersion: (workspaceId: string, workflowId: string) => Promise<WorkflowVersionEntity> }>;

  const credentialsService = {
    getCredential: jest.fn(),
  } as Partial<{ getCredential: (workspaceId: string, credentialId: string) => Promise<Record<string, unknown>> }>;

  const executionsService = {
    markRunning: jest.fn(),
    markFinished: jest.fn(),
    appendStep: jest.fn(),
  } as Record<string, jest.Mock>;

  const responseRegistry = {
    consume: jest.fn(),
  } as Partial<{ consume: (correlationId: string) => { resolve: jest.Mock; reject: jest.Mock } | null }>;

  const webhookService = {} as any;
  const queueService = {
    enqueueDeliver: jest.fn(),
  } as Partial<{ enqueueDeliver: (payload: { executionId: string; workspaceId: string }) => Promise<void> }>;

  let service: WorkflowEngineService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WorkflowEngineService(
      workflowsService as any,
      credentialsService as any,
      executionsService as any,
      responseRegistry as any,
      webhookService,
      queueService as any,
    );
  });

  it('runs inline workflow with respond node', async () => {
    const definition: WorkflowDefinition = {
      nodes: [
        { id: 'webhookIn', type: 'webhook.in' },
        {
          id: 'setVars',
          type: 'set',
          params: {
            assign: {
              email: '{{.email}}',
              subject: '{{.subject}}',
              body: '{{.body}}',
            },
          },
        },
        {
          id: 'respond',
          type: 'webhook.respond',
          params: {
            status: 200,
            json: {
              status: 'sent',
              to: '{{.email}}',
            },
          },
        },
      ],
      connections: [
        { from: 'webhookIn', to: 'setVars' },
        { from: 'setVars', to: 'respond' },
      ],
    };

    const workflowVersion: WorkflowVersionEntity = {
      id: 'version-1',
      workflowId: 'workflow-1',
      version: 1,
      definition,
      checksum: 'checksum',
      createdAt: new Date(),
    };

    (workflowsService.getActiveVersion as jest.Mock).mockResolvedValue(workflowVersion);
    (executionsService.markRunning as jest.Mock).mockResolvedValue(undefined);
    (executionsService.markFinished as jest.Mock).mockResolvedValue(undefined);
    (executionsService.appendStep as jest.Mock).mockResolvedValue(undefined);

    const responder = { resolve: jest.fn(), reject: jest.fn() };
    (responseRegistry.consume as jest.Mock).mockReturnValue(responder);

    (credentialsService.getCredential as jest.Mock).mockResolvedValue({});

    await service.runInline({
      workspaceId: 'workspace-1',
      workflowId: 'workflow-1',
      executionId: 'execution-1',
      correlationId: 'correlation-1',
      initialItems: [
        {
          json: {
            email: 'user@example.com',
            subject: 'Hello',
            body: 'Welcome to FluxoLab!',
          },
        },
      ],
    });

    expect(executionsService.markRunning).toHaveBeenCalledWith('execution-1');
    expect(executionsService.appendStep).toHaveBeenCalledTimes(3);
    expect(executionsService.markFinished).toHaveBeenCalledWith('execution-1', 'succeeded');
    expect(responseRegistry.consume).toHaveBeenCalledWith('correlation-1');
    expect(responder.resolve).toHaveBeenCalledWith(200, {
      status: 'sent',
      to: 'user@example.com',
    });
  });
});
