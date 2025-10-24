export declare class Alert {
    id: string;
    workspaceId: string;
    tenantId: string;
    name: string;
    description: string;
    alertType: 'execution_failure' | 'performance_degradation' | 'resource_usage' | 'custom';
    conditions: any;
    isActive: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
    notificationChannels: any;
    triggerCount: number;
    lastTriggered: Date;
    createdAt: Date;
    updatedAt: Date;
}
