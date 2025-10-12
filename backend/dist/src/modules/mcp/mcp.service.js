"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var McpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mcp_client_service_1 = require("./mcp-client.service");
const mcp_tools_service_1 = require("./mcp-tools.service");
let McpService = McpService_1 = class McpService {
    config;
    mcpClient;
    mcpTools;
    logger = new common_1.Logger(McpService_1.name);
    isConnected = false;
    constructor(config, mcpClient, mcpTools) {
        this.config = config;
        this.mcpClient = mcpClient;
        this.mcpTools = mcpTools;
    }
    errStack(e) {
        if (e instanceof Error)
            return e.stack;
        try {
            return JSON.stringify(e);
        }
        catch {
            return String(e);
        }
    }
    async initialize() {
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
        }
        catch (error) {
            this.logger.error('Failed to connect to MCP server', this.errStack(error));
            this.isConnected = false;
        }
    }
    async getAvailableTools() {
        if (!this.isConnected)
            return [];
        try {
            return await this.mcpClient.listTools();
        }
        catch (error) {
            this.logger.error('Failed to get available tools', this.errStack(error));
            return [];
        }
    }
    async getAvailableResources() {
        if (!this.isConnected)
            return [];
        try {
            return await this.mcpClient.listResources();
        }
        catch (error) {
            this.logger.error('Failed to get available resources', this.errStack(error));
            return [];
        }
    }
    async getAvailablePrompts() {
        if (!this.isConnected)
            return [];
        try {
            return await this.mcpClient.listPrompts();
        }
        catch (error) {
            this.logger.error('Failed to get available prompts', this.errStack(error));
            return [];
        }
    }
    async callTool(toolName, arguments_) {
        if (!this.isConnected)
            throw new Error('MCP client not connected');
        try {
            return await this.mcpClient.callTool(toolName, arguments_);
        }
        catch (error) {
            this.logger.error(`Failed to call tool ${toolName}`, this.errStack(error));
            throw error;
        }
    }
    async readResource(uri) {
        if (!this.isConnected)
            throw new Error('MCP client not connected');
        try {
            return await this.mcpClient.readResource(uri);
        }
        catch (error) {
            this.logger.error(`Failed to read resource ${uri}`, this.errStack(error));
            throw error;
        }
    }
    async getPrompt(promptName, arguments_) {
        if (!this.isConnected)
            throw new Error('MCP client not connected');
        try {
            return await this.mcpClient.getPrompt(promptName, arguments_);
        }
        catch (error) {
            this.logger.error(`Failed to get prompt ${promptName}`, this.errStack(error));
            throw error;
        }
    }
    async executeWorkflowStep(stepId, context) {
        if (!this.isConnected)
            return { success: false, error: 'MCP not available' };
        try {
            const result = await this.mcpTools.executeWorkflowStep(stepId, context);
            return { success: true, result };
        }
        catch (error) {
            this.logger.error(`Failed to execute workflow step ${stepId}`, this.errStack(error));
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async generateWorkflowCode(description, language = 'javascript') {
        if (!this.isConnected)
            throw new Error('MCP not available for code generation');
        try {
            return await this.mcpTools.generateWorkflowCode(description, language);
        }
        catch (error) {
            this.logger.error('Failed to generate workflow code', this.errStack(error));
            throw error;
        }
    }
    async analyzeWorkflow(workflowDefinition) {
        if (!this.isConnected)
            throw new Error('MCP not available for workflow analysis');
        try {
            return await this.mcpTools.analyzeWorkflow(workflowDefinition);
        }
        catch (error) {
            this.logger.error('Failed to analyze workflow', this.errStack(error));
            throw error;
        }
    }
    async validateWorkflow(definition) {
        const issues = [];
        if (!definition)
            issues.push('Definition is required');
        const nodes = definition?.nodes ?? [];
        const edges = definition?.edges ?? [];
        if (!Array.isArray(nodes))
            issues.push('nodes[] is required');
        if (!Array.isArray(edges))
            issues.push('edges[] is required');
        const ids = new Set();
        for (const n of nodes) {
            if (!n?.id)
                issues.push('Each node must have an id');
            if (n?.id) {
                if (ids.has(n.id))
                    issues.push(`Duplicate node id: ${n.id}`);
                ids.add(n.id);
            }
            if (!n?.type)
                issues.push(`Node ${n?.id ?? '(unknown)'} missing type`);
        }
        for (const e of edges) {
            if (!e?.from || !e?.to)
                issues.push('Each edge must have `from` and `to`');
            if (e?.from && !ids.has(e.from))
                issues.push(`Edge.from references unknown node: ${e.from}`);
            if (e?.to && !ids.has(e.to))
                issues.push(`Edge.to references unknown node: ${e.to}`);
        }
        return { valid: issues.length === 0, issues };
    }
    async optimizeWorkflow(definition) {
        const changes = [];
        const nodes = (definition?.nodes ?? []).filter(n => !n?.disabled);
        if (nodes.length !== (definition?.nodes ?? []).length) {
            changes.push('Removed disabled nodes');
        }
        const validIds = new Set(nodes.map(n => n.id));
        const edges = (definition?.edges ?? []).filter(e => validIds.has(e.from) && validIds.has(e.to));
        if (edges.length !== (definition?.edges ?? []).length) {
            changes.push('Removed dangling edges');
        }
        const optimized = {
            ...definition,
            nodes,
            edges,
        };
        return { optimized, changes };
    }
    async generateDocumentation(definition) {
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
    async simulateWorkflow(definition, inputs = {}) {
        const logs = [];
        const push = (message) => logs.push({ ts: new Date().toISOString(), message });
        const { valid, issues } = await this.validateWorkflow(definition);
        if (!valid) {
            push(`Simulation aborted: invalid definition (${issues.length} issues)`);
            return { logs, output: { ok: false, issues } };
        }
        push('Simulation started');
        for (const node of definition.nodes) {
            if (node.disabled) {
                push(`Skipping node ${node.id} (disabled)`);
                continue;
            }
            push(`Executing node ${node.id} (${node.type})`);
        }
        push('Simulation finished');
        return { logs, output: { ok: true, inputsEcho: inputs } };
    }
    isMcpAvailable() {
        return this.isConnected;
    }
    async disconnect() {
        if (this.isConnected) {
            await this.mcpClient.disconnect();
            this.isConnected = false;
            this.logger.log('MCP client disconnected');
        }
    }
};
exports.McpService = McpService;
exports.McpService = McpService = McpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        mcp_client_service_1.McpClient,
        mcp_tools_service_1.McpToolsService])
], McpService);
//# sourceMappingURL=mcp.service.js.map