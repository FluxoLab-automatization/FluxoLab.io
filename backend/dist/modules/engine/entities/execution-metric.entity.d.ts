export declare class ExecutionMetric {
    id: string;
    workspaceId: string;
    tenantId: string;
    workflowId: string;
    runId: string;
    metricType: 'execution_time' | 'memory_usage' | 'cpu_usage' | 'error_rate' | 'throughput';
    value: number;
    unit: string;
    metadata: any;
    createdAt: Date;
}
