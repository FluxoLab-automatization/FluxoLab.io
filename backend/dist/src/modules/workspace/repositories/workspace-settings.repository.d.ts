import { DatabaseService } from '../../../shared/database/database.service';
export interface WorkspaceSettings {
    workspaceId: string;
    preferences: Record<string, unknown>;
    notifications: Record<string, unknown>;
    branding: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
export declare class WorkspaceSettingsRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    private mapRow;
    ensureDefaults(workspaceId: string): Promise<void>;
    updatePreferences(workspaceId: string, preferences: Record<string, unknown>): Promise<WorkspaceSettings>;
    findByWorkspaceId(workspaceId: string): Promise<WorkspaceSettings | null>;
}
