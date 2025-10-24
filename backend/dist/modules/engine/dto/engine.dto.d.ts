export declare class StartWorkflowDto {
    tenantId: string;
    workspaceId: string;
    userId?: string;
    triggerData: Record<string, any>;
    correlationId?: string;
    traceId?: string;
}
export declare class ProcessNodeDto {
    runId: string;
    nodeId: string;
    nodeData: Record<string, any>;
    inputData: Record<string, any>;
    context: Record<string, any>;
}
export declare class CreateHumanTaskDto {
    runId: string;
    stepId: string;
    taskType: string;
    title: string;
    description?: string;
    instructions?: string;
    priority?: string;
    assignedTo?: string;
    assignedToEmail?: string;
    assignedToName?: string;
    slaHours?: number;
    inputData?: Record<string, any>;
}
export declare class ProcessHumanTaskDto {
    action: string;
    comment?: string;
    outputData?: Record<string, any>;
}
