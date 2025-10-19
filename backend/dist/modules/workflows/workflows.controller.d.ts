import type { AuthenticatedUser } from '../auth/auth.types';
import { WorkflowsService } from './workflows.service';
import { WorkflowExecutionsService } from './workflow-executions.service';
import { WorkflowEngineService } from './workflow-engine.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
export declare class WorkflowsController {
    private readonly workflows;
    private readonly executions;
    private readonly engine;
    constructor(workflows: WorkflowsService, executions: WorkflowExecutionsService, engine: WorkflowEngineService);
    createWorkflow(user: AuthenticatedUser, payload: CreateWorkflowDto): Promise<{
        status: string;
        workflow: {
            id: string;
            version: number;
        };
    }>;
    executeWorkflow(user: AuthenticatedUser, workflowId: string, body: Record<string, unknown>): Promise<{
        status: string;
        executionId: string;
    }>;
}
