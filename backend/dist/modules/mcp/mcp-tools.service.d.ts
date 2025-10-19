import { McpClient } from './mcp-client.service';
export interface WorkflowStepResult {
    success: boolean;
    output?: any;
    error?: string;
    metadata?: Record<string, any>;
}
export interface WorkflowAnalysis {
    complexity: 'low' | 'medium' | 'high';
    estimatedExecutionTime: number;
    potentialIssues: string[];
    recommendations: string[];
    dependencies: string[];
}
export declare class McpToolsService {
    private readonly mcpClient;
    private readonly logger;
    constructor(mcpClient: McpClient);
    executeWorkflowStep(stepId: string, context: Record<string, any>): Promise<WorkflowStepResult>;
    generateWorkflowCode(description: string, language?: string): Promise<string>;
    analyzeWorkflow(workflowDefinition: any): Promise<WorkflowAnalysis>;
    validateWorkflow(workflowDefinition: any): Promise<{
        isValid: boolean;
        errors: string[];
        warnings: string[];
    }>;
    optimizeWorkflow(workflowDefinition: any): Promise<{
        optimized: any;
        improvements: string[];
        performanceGains: Record<string, number>;
    }>;
    generateDocumentation(workflowDefinition: any): Promise<string>;
    simulateWorkflow(workflowDefinition: any, inputs: Record<string, any>): Promise<{
        outputs: Record<string, any>;
        executionPath: string[];
        performance: {
            totalTime: number;
            stepTimes: Record<string, number>;
        };
    }>;
    suggestWorkflowImprovements(workflowDefinition: any): Promise<{
        suggestions: Array<{
            type: 'performance' | 'security' | 'maintainability' | 'usability';
            title: string;
            description: string;
            priority: 'low' | 'medium' | 'high';
            implementation: string;
        }>;
    }>;
    generateTests(workflowDefinition: any): Promise<{
        unitTests: string;
        integrationTests: string;
        testData: Record<string, any>;
    }>;
    createWorkflowTemplate(category: string, requirements: string[]): Promise<any>;
    migrateWorkflow(fromVersion: string, toVersion: string, workflowDefinition: any): Promise<any>;
}
