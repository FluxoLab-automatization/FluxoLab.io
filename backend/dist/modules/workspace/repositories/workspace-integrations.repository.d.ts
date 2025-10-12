import { DatabaseService } from '../../../shared/database/database.service';
export declare class WorkspaceIntegrationsRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    seedPlaceholders(workspaceId: string): Promise<void>;
}
