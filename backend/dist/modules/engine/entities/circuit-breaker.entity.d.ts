export declare class CircuitBreaker {
    id: string;
    name: string;
    serviceName: string;
    workspaceId: string;
    tenantId: string;
    state: 'closed' | 'open' | 'half-open';
    failureCount: number;
    failureThreshold: number;
    timeout: number;
    lastFailureTime: Date;
    nextAttemptTime: Date;
    createdAt: Date;
    updatedAt: Date;
}
