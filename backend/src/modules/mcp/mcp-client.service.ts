import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

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

@Injectable()
export class McpClient {
  private readonly logger = new Logger(McpClient.name);
  private client: AxiosInstance | null = null;
  private serverUrl: string | null = null;

  async connect(serverUrl: string, apiKey?: string): Promise<void> {
    this.serverUrl = serverUrl;
    
    this.client = axios.create({
      baseURL: serverUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
      },
    });

    // Test connection
    try {
      await this.client.get('/health');
      this.logger.log('MCP server connection established');
    } catch (error) {
      this.logger.error('Failed to connect to MCP server', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.client = null;
    this.serverUrl = null;
    this.logger.log('MCP client disconnected');
  }

  async listTools(): Promise<McpTool[]> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.get('/tools');
      return response.data.tools || [];
    } catch (error) {
      this.logger.error('Failed to list tools', error);
      throw error;
    }
  }

  async listResources(): Promise<McpResource[]> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.get('/resources');
      return response.data.resources || [];
    } catch (error) {
      this.logger.error('Failed to list resources', error);
      throw error;
    }
  }

  async listPrompts(): Promise<McpPrompt[]> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.get('/prompts');
      return response.data.prompts || [];
    } catch (error) {
      this.logger.error('Failed to list prompts', error);
      throw error;
    }
  }

  async callTool(toolName: string, arguments_: Record<string, any>): Promise<any> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.post('/tools/call', {
        name: toolName,
        arguments: arguments_,
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to call tool ${toolName}`, error);
      throw error;
    }
  }

  async readResource(uri: string): Promise<string> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.post('/resources/read', {
        uri,
      });
      return response.data.content;
    } catch (error) {
      this.logger.error(`Failed to read resource ${uri}`, error);
      throw error;
    }
  }

  async getPrompt(promptName: string, arguments_: Record<string, any>): Promise<string> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.post('/prompts/get', {
        name: promptName,
        arguments: arguments_,
      });
      return response.data.prompt;
    } catch (error) {
      this.logger.error(`Failed to get prompt ${promptName}`, error);
      throw error;
    }
  }

  async sendNotification(message: string, type: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      await this.client.post('/notifications', {
        message,
        type,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Failed to send notification', error);
      throw error;
    }
  }

  async getServerInfo(): Promise<any> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.get('/info');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get server info', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.client !== null;
  }

  getServerUrl(): string | null {
    return this.serverUrl;
  }
}
