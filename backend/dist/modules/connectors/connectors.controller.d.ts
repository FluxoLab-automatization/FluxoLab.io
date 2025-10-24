import { ConnectorsService } from './connectors.service';
export declare class ConnectorsController {
    private readonly connectorsService;
    constructor(connectorsService: ConnectorsService);
    getConnectors(workspaceId: string, category?: string, status?: string): Promise<import("./entities").Connector[]>;
    getConnector(id: string): Promise<import("./entities").Connector | null>;
    createConnector(createConnectorDto: any): Promise<import("./entities").Connector[]>;
    updateConnector(id: string, updateConnectorDto: any): Promise<import("./entities").Connector | null>;
    deleteConnector(id: string): Promise<import("typeorm").DeleteResult>;
    getConnectorActions(id: string): Promise<import("./entities").ConnectorAction[]>;
    testConnector(id: string, testData: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
