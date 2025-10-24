export declare class ScheduleJob {
    id: string;
    workspaceId: string;
    tenantId: string;
    workflowId: string;
    name: string;
    cronExpression: string;
    isActive: boolean;
    triggerData: any;
    lastExecution: Date;
    nextExecution: Date;
    executionCount: number;
    failureCount: number;
    createdAt: Date;
    updatedAt: Date;
}
