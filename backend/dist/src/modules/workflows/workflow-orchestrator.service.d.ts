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
export declare class WorkflowOrchestratorService {
    private readonly webhookService;
    private readonly executionsService;
    private readonly workflowsService;
    private readonly engine;
    private readonly responseRegistry;
    private readonly metrics;
    private readonly logger;
    constructor(webhookService: WorkflowWebhookService, executionsService: WorkflowExecutionsService, workflowsService: WorkflowsService, engine: WorkflowEngineService, responseRegistry: WorkflowResponseRegistry, metrics: MetricsService);
    triggerViaWebhook(payload: TriggerPayload): Promise<{
        executionId: string;
    }>;
}
export {};
