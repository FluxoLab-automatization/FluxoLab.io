import { DatabaseService } from '../../shared/database/database.service';
interface ExecutionRow {
    id: string;
    workspace_id: string;
    workflow_id: string;
    workflow_version_id: string;
    status: string;
    started_at: Date | null;
    finished_at: Date | null;
    created_at: Date;
}
export interface CreateExecutionParams {
    workspaceId: string;
    workflowId: string;
    workflowVersionId: string;
    triggerEventId?: string | null;
    correlationId?: string | null;
}
export interface ExecutionWithDetails {
    id: string;
    workspaceId: string;
    workflowId: string;
    workflowVersionId: string;
    triggerEventId: string | null;
    correlationId: string | null;
    status: string;
}
export interface AppendStepParams {
    executionId: string;
    nodeId: string;
    nodeName: string;
    status: 'running' | 'succeeded' | 'failed' | 'skipped';
    attempt: number;
    inputItems?: unknown;
    outputItems?: unknown;
    logs?: unknown;
    error?: unknown;
}
export declare class WorkflowExecutionsService {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    createExecution(params: CreateExecutionParams): Promise<ExecutionRow>;
    markRunning(executionId: string): Promise<void>;
    markFinished(executionId: string, status: 'succeeded' | 'failed' | 'canceled', error?: unknown): Promise<void>;
    appendStep(params: AppendStepParams): Promise<void>;
    listExecutions(workspaceId: string, workflowId: string, options: {
        limit: number;
        offset: number;
    }): Promise<ExecutionWithDetails[]>;
    getExecution(executionId: string): Promise<ExecutionWithDetails | null>;
}
export {};
