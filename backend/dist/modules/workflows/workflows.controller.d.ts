import type { AuthenticatedUser } from '../auth/auth.types';
import { WorkflowsService } from './workflows.service';
import { WorkflowExecutionsService } from './workflow-executions.service';
import { WorkflowEngineService } from './workflow-engine.service';
import { WorkflowCredentialsService } from './workflow-credentials.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { WorkflowDefinition } from './engine/types';
export declare class WorkflowsController {
    private readonly workflows;
    private readonly executions;
    private readonly engine;
    private readonly credentials;
    constructor(workflows: WorkflowsService, executions: WorkflowExecutionsService, engine: WorkflowEngineService, credentials: WorkflowCredentialsService);
    createWorkflow(user: AuthenticatedUser, payload: CreateWorkflowDto): Promise<{
        status: string;
        workflow: {
            id: string;
            version: number;
        };
    }>;
    listWorkflows(user: AuthenticatedUser, limit?: string, offset?: string): Promise<{
        status: string;
        workflows: import("./workflows.service").WorkflowEntity[];
    }>;
    getCredentials(user: AuthenticatedUser): Promise<{
        status: string;
        credentials: import("./workflow-credentials.service").WorkflowCredential[];
    }>;
    getWorkflow(user: AuthenticatedUser, workflowId: string): Promise<{
        status: string;
        workflow: {
            definition: WorkflowDefinition;
            version: number;
            id: string;
            workspaceId: string;
            name: string;
            status: "draft" | "active" | "archived";
            activeVersionId: string | null;
            tags: string[];
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    updateWorkflow(user: AuthenticatedUser, workflowId: string, payload: Partial<CreateWorkflowDto>): Promise<{
        status: string;
        workflow: import("./workflows.service").WorkflowEntity;
    }>;
    deleteWorkflow(user: AuthenticatedUser, workflowId: string): Promise<{
        status: string;
        message: string;
    }>;
    listWorkflowExecutions(user: AuthenticatedUser, workflowId: string, limit?: string, offset?: string): Promise<{
        status: string;
        executions: import("./workflow-executions.service").ExecutionWithDetails[];
    }>;
    executeWorkflow(user: AuthenticatedUser, workflowId: string, body: Record<string, unknown>): Promise<{
        status: string;
        executionId: string;
    }>;
}
