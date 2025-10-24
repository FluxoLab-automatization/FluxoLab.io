export declare class Connection {
    id: string;
    workspaceId: string;
    connectorId: string;
    name: string;
    description: string;
    config: Record<string, any>;
    isActive: boolean;
    createdBy: string;
    created_at: Date;
    updated_at: Date;
}
