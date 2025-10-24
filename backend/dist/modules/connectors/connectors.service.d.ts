import { Repository } from 'typeorm';
import { Connector, ConnectorVersion, ConnectorAction } from './entities';
export declare class ConnectorsService {
    private connectorRepository;
    private connectorVersionRepository;
    private connectorActionRepository;
    private readonly logger;
    constructor(connectorRepository: Repository<Connector>, connectorVersionRepository: Repository<ConnectorVersion>, connectorActionRepository: Repository<ConnectorAction>);
    findAll(workspaceId: string, filters?: {
        category?: string;
        connectorType?: string;
        isActive?: boolean;
        isPublic?: boolean;
    }): Promise<Connector[]>;
    findOne(id: string, workspaceId: string): Promise<Connector | null>;
    findBySlug(slug: string, workspaceId: string): Promise<Connector | null>;
    create(workspaceId: string, createConnectorDto: any, userId: string): Promise<Connector[]>;
    update(id: string, workspaceId: string, updateConnectorDto: any): Promise<Connector | null>;
    remove(id: string, workspaceId: string): Promise<void>;
    getActiveVersion(connectorId: string): Promise<ConnectorVersion | null>;
    getActions(connectorId: string, actionType?: string): Promise<ConnectorAction[]>;
    testConnection(connectorId: string, config: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getConnectors(workspaceId: string, filters?: {
        category?: string;
        status?: string;
    }): Promise<Connector[]>;
    getConnector(id: string): Promise<Connector | null>;
    createConnector(createConnectorDto: any): Promise<Connector[]>;
    updateConnector(id: string, updateConnectorDto: any): Promise<Connector | null>;
    deleteConnector(id: string): Promise<import("typeorm").DeleteResult>;
    getConnectorActions(id: string): Promise<ConnectorAction[]>;
    testConnector(id: string, testData: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
