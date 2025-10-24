export declare class SystemEvent {
    id: string;
    eventType: string;
    tenantId: string;
    workspaceId: string;
    runId: string;
    correlationId: string;
    traceId: string;
    spanId: string;
    payload: Record<string, any>;
    checksum: string;
    created_at: Date;
}
