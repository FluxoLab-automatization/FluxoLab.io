export declare class CompensationAction {
    id: string;
    runId: string;
    stepId: string;
    actionType: string;
    actionData: any;
    status: 'pending' | 'executed' | 'failed';
    executedAt: Date;
    errorMessage: string;
    createdAt: Date;
    updatedAt: Date;
}
