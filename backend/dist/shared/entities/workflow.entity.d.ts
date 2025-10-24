import { Execution } from './execution.entity';
import { WorkflowVersion } from './workflow-version.entity';
export declare class Workflow {
    id: string;
    name: string;
    description: string;
    workspaceId: string;
    tenantId: string;
    isActive: boolean;
    isPublic: boolean;
    tags: string[];
    metadata: any;
    activeVersionId: string;
    executions: Execution[];
    versions: WorkflowVersion[];
    activeVersion: WorkflowVersion;
    createdAt: Date;
    updatedAt: Date;
}
