import { DatabaseService } from '../../../shared/database/database.service';
export interface WorkspaceEntity {
    id: string;
    ownerId: string | null;
    planId: string | null;
    name: string;
    slug: string;
    status: 'active' | 'suspended' | 'archived';
    timezone: string;
    region: string | null;
    settings: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
export declare class WorkspacesRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    private normalize;
    private slugify;
    private slugExists;
    generateUniqueSlug(name: string): Promise<string>;
    createWorkspace(params: {
        ownerId: string | null;
        planId: string | null;
        name: string;
        slug: string;
        timezone?: string;
        region?: string | null;
        settings?: Record<string, unknown>;
    }): Promise<WorkspaceEntity>;
    findById(id: string): Promise<WorkspaceEntity | null>;
    findBySlug(slug: string): Promise<WorkspaceEntity | null>;
    updatePlan(workspaceId: string, planId: string): Promise<void>;
    findDefaultForUser(userId: string): Promise<WorkspaceEntity | null>;
}
