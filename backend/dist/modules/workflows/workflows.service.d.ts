import { DatabaseService } from '../../shared/database/database.service';
import { WorkflowDefinition } from './engine/types';
export interface WorkflowEntity {
    id: string;
    workspaceId: string;
    name: string;
    status: 'draft' | 'active' | 'archived';
    activeVersionId: string | null;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface WorkflowVersionEntity {
    id: string;
    workflowId: string;
    version: number;
    definition: WorkflowDefinition;
    checksum: string;
    createdAt: Date;
}
export declare class WorkflowsService {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    createWorkflow(params: {
        workspaceId: string;
        name: string;
        createdBy?: string | null;
        tags?: string[];
    }): Promise<WorkflowEntity>;
    createVersion(params: {
        workflowId: string;
        definition: WorkflowDefinition;
        checksum: string;
        createdBy?: string | null;
    }): Promise<WorkflowVersionEntity>;
    activateVersion(workspaceId: string, workflowId: string, versionId: string): Promise<void>;
    getWorkflow(workspaceId: string, workflowId: string): Promise<WorkflowEntity>;
    getActiveVersion(workspaceId: string, workflowId: string): Promise<WorkflowVersionEntity>;
    private getNextVersion;
    private mapWorkflow;
    private mapVersion;
}
