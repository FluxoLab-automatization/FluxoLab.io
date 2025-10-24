export declare class ConnectorAction {
    id: string;
    connectorId: string;
    actionName: string;
    actionType: string;
    description: string;
    inputSchema: Record<string, any>;
    outputSchema: Record<string, any>;
    isActive: boolean;
    created_at: Date;
    updated_at: Date;
}
