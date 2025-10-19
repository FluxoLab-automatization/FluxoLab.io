import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/env.validation';
import { McpClient } from './mcp-client.service';
import { McpToolsService } from './mcp-tools.service';
export interface McpTool {
    name: string;
    description: string;
    parameters: Record<string, any>;
}
export interface McpResource {
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
}
export interface McpPrompt {
    name: string;
    description: string;
    arguments: Record<string, any>;
}
export type WorkflowNode = {
    id: string;
    type: string;
    config?: Record<string, any>;
    disabled?: boolean;
};
export type WorkflowEdge = {
    from: string;
    to: string;
};
export type WorkflowDefinition = {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    meta?: Record<string, any>;
};
export declare class McpService {
    private readonly config;
    private readonly mcpClient;
    private readonly mcpTools;
    private readonly logger;
    private isConnected;
    constructor(config: ConfigService<AppConfig, true>, mcpClient: McpClient, mcpTools: McpToolsService);
    private errStack;
    initialize(): Promise<void>;
    getAvailableTools(): Promise<McpTool[]>;
    getAvailableResources(): Promise<McpResource[]>;
    getAvailablePrompts(): Promise<McpPrompt[]>;
    callTool(toolName: string, arguments_: Record<string, any>): Promise<any>;
    readResource(uri: string): Promise<string>;
    getPrompt(promptName: string, arguments_: Record<string, any>): Promise<string>;
    executeWorkflowStep(stepId: string, context: Record<string, any>): Promise<any>;
    generateWorkflowCode(description: string, language?: string): Promise<string>;
    analyzeWorkflow(workflowDefinition: WorkflowDefinition): Promise<any>;
    validateWorkflow(definition: WorkflowDefinition): Promise<{
        valid: boolean;
        issues: string[];
    }>;
    optimizeWorkflow(definition: WorkflowDefinition): Promise<{
        optimized: WorkflowDefinition;
        changes: string[];
    }>;
    generateDocumentation(definition: WorkflowDefinition): Promise<{
        markdown: string;
    }>;
    simulateWorkflow(definition: WorkflowDefinition, inputs?: Record<string, any>): Promise<{
        logs: Array<{
            ts: string;
            message: string;
        }>;
        output: any;
    }>;
    isMcpAvailable(): boolean;
    disconnect(): Promise<void>;
}
