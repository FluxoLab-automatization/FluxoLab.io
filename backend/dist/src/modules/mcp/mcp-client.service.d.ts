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
export declare class McpClient {
    private readonly logger;
    private client;
    private serverUrl;
    connect(serverUrl: string, apiKey?: string): Promise<void>;
    disconnect(): Promise<void>;
    listTools(): Promise<McpTool[]>;
    listResources(): Promise<McpResource[]>;
    listPrompts(): Promise<McpPrompt[]>;
    callTool(toolName: string, arguments_: Record<string, any>): Promise<any>;
    readResource(uri: string): Promise<string>;
    getPrompt(promptName: string, arguments_: Record<string, any>): Promise<string>;
    sendNotification(message: string, type?: 'info' | 'warning' | 'error'): Promise<void>;
    getServerInfo(): Promise<any>;
    isConnected(): boolean;
    getServerUrl(): string | null;
}
