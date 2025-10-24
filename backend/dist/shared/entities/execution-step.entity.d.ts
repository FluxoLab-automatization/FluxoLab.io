import { Execution } from './execution.entity';
export declare class ExecutionStep {
    id: string;
    executionId: string;
    nodeId: string;
    nodeName: string;
    nodeType: string;
    status: 'pending' | 'running' | 'succeeded' | 'failed' | 'skipped';
    inputItems: any;
    outputItems: any;
    startedAt: Date;
    finishedAt: Date;
    errorMessage: string;
    metadata: any;
    execution: Execution;
    createdAt: Date;
    updatedAt: Date;
}
