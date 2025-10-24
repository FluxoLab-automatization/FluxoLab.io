export declare class AlertNotification {
    id: string;
    alertId: string;
    workspaceId: string;
    tenantId: string;
    channelType: 'email' | 'slack' | 'webhook' | 'sms';
    channelConfig: string;
    isActive: boolean;
    sentCount: number;
    lastSent: Date;
    createdAt: Date;
    updatedAt: Date;
}
