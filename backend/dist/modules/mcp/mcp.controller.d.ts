import { McpService } from './mcp.service';
import { McpClient } from './mcp-client.service';
export declare class McpController {
    private readonly mcpService;
    private readonly mcpClient;
    constructor(mcpService: McpService, mcpClient: McpClient);
    getStatus(): Promise<{
        status: string;
        available: boolean;
        serverUrl: string | null;
        connected: boolean;
    }>;
    getTools(): Promise<{
        status: string;
        tools: import("./mcp.service").McpTool[];
    }>;
    getResources(): Promise<{
        status: string;
        resources: import("./mcp.service").McpResource[];
    }>;
    getPrompts(): Promise<{
        status: string;
        prompts: import("./mcp.service").McpPrompt[];
    }>;
    callTool(toolName: string, body: {
        arguments: Record<string, any>;
    }): Promise<{
        status: string;
        result: any;
    }>;
    readResource(body: {
        uri: string;
    }): Promise<{
        status: string;
        content: string;
    }>;
    getPrompt(promptName: string, body: {
        arguments: Record<string, any>;
    }): Promise<{
        status: string;
        prompt: string;
    }>;
    executeWorkflowStep(body: {
        stepId: string;
        context: Record<string, any>;
    }): Promise<{
        status: string;
        result: any;
    }>;
    generateWorkflowCode(body: {
        description: string;
        language?: string;
    }): Promise<{
        status: string;
        code: string;
    }>;
    analyzeWorkflow(body: {
        definition: any;
    }): Promise<{
        status: string;
        analysis: any;
    }>;
    validateWorkflow(body: {
        definition: any;
    }): Promise<{
        status: string;
        validation: {
            valid: boolean;
            issues: string[];
        };
    }>;
    optimizeWorkflow(body: {
        definition: any;
    }): Promise<{
        status: string;
        optimization: {
            optimized: import("./mcp.service").WorkflowDefinition;
            changes: string[];
        };
    }>;
    generateDocumentation(body: {
        definition: any;
    }): Promise<{
        status: string;
        documentation: {
            markdown: string;
        };
    }>;
    simulateWorkflow(body: {
        definition: any;
        inputs: Record<string, any>;
    }): Promise<{
        status: string;
        simulation: {
            logs: Array<{
                ts: string;
                message: string;
            }>;
            output: any;
        };
    }>;
}
