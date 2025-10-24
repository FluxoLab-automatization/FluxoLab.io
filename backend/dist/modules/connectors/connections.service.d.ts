import { Repository } from 'typeorm';
import { Connection } from './entities';
export declare class ConnectionsService {
    private connectionRepository;
    private readonly logger;
    constructor(connectionRepository: Repository<Connection>);
    getConnections(workspaceId: string, filters?: any): Promise<Connection[]>;
    getConnection(id: string): Promise<Connection | null>;
    createConnection(createConnectionDto: any): Promise<Connection[]>;
    updateConnection(id: string, updateConnectionDto: any): Promise<Connection | null>;
    deleteConnection(id: string): Promise<import("typeorm").DeleteResult>;
    testConnection(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
