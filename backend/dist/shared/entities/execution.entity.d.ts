import { Workflow } from './workflow.entity';
import { ExecutionStep } from './execution-step.entity';
export declare class Execution {
    id: string;
    workflowId: string;
    workspaceId: string;
    tenantId: string;
    status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
    triggerData: any;
    correlationId: string;
    traceId: string;
    startedAt: Date;
    finishedAt: Date;
    errorMessage: string;
    result: any;
    workflow: Workflow;
    steps: ExecutionStep[];
    createdAt: Date;
    updatedAt: Date;
}
