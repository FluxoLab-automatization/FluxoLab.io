export declare class ExecutionWindow {
    id: string;
    workspaceId: string;
    tenantId: string;
    name: string;
    cronExpression: string;
    isActive: boolean;
    lastExecution: Date;
    nextExecution: Date;
    metadata: any;
    createdAt: Date;
    updatedAt: Date;
}
