import { WorkflowsService } from './workflows.service';
import { WorkflowCredentialsService } from './workflow-credentials.service';
import { WorkflowExecutionsService } from './workflow-executions.service';
import { WorkflowResponseRegistry } from './workflow-response.registry';
import { WorkflowItem } from './engine/types';
import { WorkflowWebhookService } from './workflow-webhook.service';
import { WorkflowQueueService } from './workflow-queue.service';
interface ExecuteOptions {
    workspaceId: string;
    workflowId: string;
    executionId: string;
    correlationId?: string | null;
    initialItems: WorkflowItem[];
}
export declare class WorkflowEngineService {
    private readonly workflowsService;
    private readonly credentialsService;
    private readonly executionsService;
    private readonly responseRegistry;
    private readonly webhookService;
    private readonly queueService;
    private readonly logger;
    constructor(workflowsService: WorkflowsService, credentialsService: WorkflowCredentialsService, executionsService: WorkflowExecutionsService, responseRegistry: WorkflowResponseRegistry, webhookService: WorkflowWebhookService, queueService: WorkflowQueueService);
    enqueueExecution(executionId: string, workspaceId: string): Promise<void>;
    runInline(options: ExecuteOptions): Promise<void>;
    private executeDefinition;
    private resolveStartNodes;
}
export {};
