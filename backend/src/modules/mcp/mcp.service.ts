import { Injectable, Logger } from '@nestjs/common';
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

/** Tipos mínimos para workflows */
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

@Injectable()
export class McpService {
  private readonly logger = new Logger(McpService.name);
  private isConnected = false;

  constructor(
    private readonly config: ConfigService<AppConfig, true>,
    private readonly mcpClient: McpClient,
    private readonly mcpTools: McpToolsService,
  ) {}

  /** Helper para extrair stack de qualquer erro */
  private errStack(e: unknown): string | undefined {
    if (e instanceof Error) return e.stack;
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  }

  async initialize(): Promise<void> {
    const serverUrl = this.config.get('MCP_SERVER_URL');
    const apiKey = this.config.get('MCP_API_KEY');

    if (!serverUrl) {
      this.logger.warn('MCP_SERVER_URL not configured, MCP features disabled');
      return;
    }

    try {
      await this.mcpClient.connect(serverUrl, apiKey);
      this.isConnected = true;
      this.logger.log('MCP client connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to MCP server', this.errStack(error));
      this.isConnected = false;
    }
  }

  async getAvailableTools(): Promise<McpTool[]> {
    if (!this.isConnected) return [];
    try {
      return await this.mcpClient.listTools();
    } catch (error) {
      this.logger.error('Failed to get available tools', this.errStack(error));
      return [];
    }
  }

  async getAvailableResources(): Promise<McpResource[]> {
    if (!this.isConnected) return [];
    try {
      return await this.mcpClient.listResources();
    } catch (error) {
      this.logger.error('Failed to get available resources', this.errStack(error));
      return [];
    }
  }

  async getAvailablePrompts(): Promise<McpPrompt[]> {
    if (!this.isConnected) return [];
    try {
      return await this.mcpClient.listPrompts();
    } catch (error) {
      this.logger.error('Failed to get available prompts', this.errStack(error));
      return [];
    }
  }

  async callTool(toolName: string, arguments_: Record<string, any>): Promise<any> {
    if (!this.isConnected) throw new Error('MCP client not connected');
    try {
      return await this.mcpClient.callTool(toolName, arguments_);
    } catch (error) {
      this.logger.error(`Failed to call tool ${toolName}`, this.errStack(error));
      throw error;
    }
  }

  async readResource(uri: string): Promise<string> {
    if (!this.isConnected) throw new Error('MCP client not connected');
    try {
      return await this.mcpClient.readResource(uri);
    } catch (error) {
      this.logger.error(`Failed to read resource ${uri}`, this.errStack(error));
      throw error;
    }
  }

  async getPrompt(promptName: string, arguments_: Record<string, any>): Promise<string> {
    if (!this.isConnected) throw new Error('MCP client not connected');
    try {
      return await this.mcpClient.getPrompt(promptName, arguments_);
    } catch (error) {
      this.logger.error(`Failed to get prompt ${promptName}`, this.errStack(error));
      throw error;
    }
  }

  // -------- FluxoLab: integração “execução de passo” --------
  async executeWorkflowStep(stepId: string, context: Record<string, any>): Promise<any> {
    if (!this.isConnected) return { success: false, error: 'MCP not available' };
    try {
      const result = await this.mcpTools.executeWorkflowStep(stepId, context);
      return { success: true, result };
    } catch (error) {
      this.logger.error(`Failed to execute workflow step ${stepId}`, this.errStack(error));
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async generateWorkflowCode(description: string, language: string = 'javascript'): Promise<string> {
    if (!this.isConnected) throw new Error('MCP not available for code generation');
    try {
      return await this.mcpTools.generateWorkflowCode(description, language);
    } catch (error) {
      this.logger.error('Failed to generate workflow code', this.errStack(error));
      throw error;
    }
  }

  async analyzeWorkflow(workflowDefinition: WorkflowDefinition): Promise<any> {
    if (!this.isConnected) throw new Error('MCP not available for workflow analysis');
    try {
      return await this.mcpTools.analyzeWorkflow(workflowDefinition);
    } catch (error) {
      this.logger.error('Failed to analyze workflow', this.errStack(error));
      throw error;
    }
  }

  // ====== MÉTODOS CHAMADOS PELO CONTROLLER (faltavam) ======

  /** Verificação básica de sanidade do grafo */
  async validateWorkflow(definition: WorkflowDefinition): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];
    if (!definition) issues.push('Definition is required');

    const nodes = definition?.nodes ?? [];
    const edges = definition?.edges ?? [];

    if (!Array.isArray(nodes)) issues.push('nodes[] is required');
    if (!Array.isArray(edges)) issues.push('edges[] is required');

    const ids = new Set<string>();
    for (const n of nodes) {
      if (!n?.id) issues.push('Each node must have an id');
      if (n?.id) {
        if (ids.has(n.id)) issues.push(`Duplicate node id: ${n.id}`);
        ids.add(n.id);
      }
      if (!n?.type) issues.push(`Node ${n?.id ?? '(unknown)'} missing type`);
    }

    for (const e of edges) {
      if (!e?.from || !e?.to) issues.push('Each edge must have `from` and `to`');
      if (e?.from && !ids.has(e.from)) issues.push(`Edge.from references unknown node: ${e.from}`);
      if (e?.to && !ids.has(e.to)) issues.push(`Edge.to references unknown node: ${e.to}`);
    }

    return { valid: issues.length === 0, issues };
  }

  /** Limpa nós desabilitados e arestas órfãs; mantém estrutura */
  async optimizeWorkflow(definition: WorkflowDefinition): Promise<{ optimized: WorkflowDefinition; changes: string[] }> {
    const changes: string[] = [];
    const nodes = (definition?.nodes ?? []).filter(n => !n?.disabled);
    if (nodes.length !== (definition?.nodes ?? []).length) {
      changes.push('Removed disabled nodes');
    }

    const validIds = new Set(nodes.map(n => n.id));
    const edges = (definition?.edges ?? []).filter(e => validIds.has(e.from) && validIds.has(e.to));
    if (edges.length !== (definition?.edges ?? []).length) {
      changes.push('Removed dangling edges');
    }

    const optimized: WorkflowDefinition = {
      ...definition,
      nodes,
      edges,
    };

    return { optimized, changes };
  }

  /** Gera um resumo em Markdown do workflow */
  async generateDocumentation(definition: WorkflowDefinition): Promise<{ markdown: string }> {
    const nodes = definition?.nodes ?? [];
    const edges = definition?.edges ?? [];

    const md = [
      '# Workflow Documentation',
      '',
      `- **Nodes**: ${nodes.length}`,
      `- **Edges**: ${edges.length}`,
      '',
      '## Nodes',
      ...nodes.map(n => `- \`${n.id}\` — **${n.type}** ${n.disabled ? '(disabled)' : ''}`),
      '',
      '## Edges',
      ...edges.map(e => `- \`${e.from}\` → \`${e.to}\``),
      '',
      '## Notes',
      '- This is an auto-generated draft. Enrich with purpose, inputs/outputs, and failure modes.',
    ].join('\n');

    return { markdown: md };
  }

  /** Simulação simples: percorre nós em ordem e registra logs */
  async simulateWorkflow(
    definition: WorkflowDefinition,
    inputs: Record<string, any> = {},
  ): Promise<{ logs: Array<{ ts: string; message: string }>; output: any }> {
    const logs: Array<{ ts: string; message: string }> = [];
    const push = (message: string) => logs.push({ ts: new Date().toISOString(), message });

    const { valid, issues } = await this.validateWorkflow(definition);
    if (!valid) {
      push(`Simulation aborted: invalid definition (${issues.length} issues)`);
      return { logs, output: { ok: false, issues } };
    }

    push('Simulation started');
    // Como stub: apenas ecoa cada node como “executado”
    for (const node of definition.nodes) {
      if (node.disabled) {
        push(`Skipping node ${node.id} (disabled)`);
        continue;
      }
      push(`Executing node ${node.id} (${node.type})`);
      // Aqui você poderia chamar mcpTools.executeWorkflowStep(node.id, {...})
    }
    push('Simulation finished');

    return { logs, output: { ok: true, inputsEcho: inputs } };
  }

  isMcpAvailable(): boolean {
    return this.isConnected;
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.mcpClient.disconnect();
      this.isConnected = false;
      this.logger.log('MCP client disconnected');
    }
  }
}
