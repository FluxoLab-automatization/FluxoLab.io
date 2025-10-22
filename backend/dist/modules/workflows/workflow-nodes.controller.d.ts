import type { AuthenticatedUser } from '../auth/auth.types';
import { WorkflowNodesService } from './workflow-nodes.service';
export declare class WorkflowNodesController {
    private readonly workflowNodesService;
    constructor(workflowNodesService: WorkflowNodesService);
    getNodeTemplates(user: AuthenticatedUser): Promise<{
        status: string;
        templates: import("./workflow-nodes.service").NodeTemplate[];
    }>;
    getNodeCategories(user: AuthenticatedUser): Promise<{
        status: string;
        categories: import("./workflow-nodes.service").NodeCategory[];
    }>;
    getTriggerTypes(user: AuthenticatedUser): Promise<{
        status: string;
        triggers: import("./workflow-nodes.service").TriggerType[];
    }>;
    validateNode(user: AuthenticatedUser, nodeData: any): Promise<{
        status: string;
        validation: import("./workflow-nodes.service").NodeValidation;
    }>;
    testNode(user: AuthenticatedUser, testData: any): Promise<{
        status: string;
        result: import("./workflow-nodes.service").NodeTestResult;
    }>;
    getNodeConfigSchema(user: AuthenticatedUser, nodeType: string): Promise<{
        status: string;
        schema: any;
    }>;
}
