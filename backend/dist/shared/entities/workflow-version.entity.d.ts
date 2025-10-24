import { Workflow } from './workflow.entity';
import { ExecutionStep } from './execution-step.entity';
export declare class WorkflowVersion {
    id: string;
    workflowId: string;
    version: string;
    isActive: boolean;
    nodes: any[];
    edges: any[];
    settings: any;
    metadata: any;
    workflow: Workflow;
    steps: ExecutionStep[];
    createdAt: Date;
    updatedAt: Date;
}
