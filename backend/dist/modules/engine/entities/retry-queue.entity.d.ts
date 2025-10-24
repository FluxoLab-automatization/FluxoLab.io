export declare class RetryQueue {
    id: string;
    runId: string;
    stepId: string;
    retryCount: number;
    maxRetries: number;
    nextRetryAt: Date;
    errorMessage: string;
    errorDetails: Record<string, any>;
    created_at: Date;
}
