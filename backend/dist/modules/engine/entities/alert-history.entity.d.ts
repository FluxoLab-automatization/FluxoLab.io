export declare class AlertHistory {
    id: string;
    alertId: string;
    workspaceId: string;
    tenantId: string;
    status: 'triggered' | 'resolved' | 'acknowledged';
    alertData: any;
    resolutionData: any;
    acknowledgedBy: string;
    acknowledgedAt: Date;
    resolvedAt: Date;
    createdAt: Date;
}
