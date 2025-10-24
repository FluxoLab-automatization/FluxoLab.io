import { ConnectionsService } from './connections.service';
export declare class ConnectionsController {
    private readonly connectionsService;
    constructor(connectionsService: ConnectionsService);
    getConnections(workspaceId: string, connectorId?: string, status?: string): Promise<import("./entities").Connection[]>;
    getConnection(id: string): Promise<import("./entities").Connection | null>;
    createConnection(createConnectionDto: any): Promise<import("./entities").Connection[]>;
    updateConnection(id: string, updateConnectionDto: any): Promise<import("./entities").Connection | null>;
    deleteConnection(id: string): Promise<import("typeorm").DeleteResult>;
    testConnection(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
