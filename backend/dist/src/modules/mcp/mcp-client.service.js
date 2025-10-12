"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var McpClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpClient = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let McpClient = McpClient_1 = class McpClient {
    logger = new common_1.Logger(McpClient_1.name);
    client = null;
    serverUrl = null;
    async connect(serverUrl, apiKey) {
        this.serverUrl = serverUrl;
        this.client = axios_1.default.create({
            baseURL: serverUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
            },
        });
        try {
            await this.client.get('/health');
            this.logger.log('MCP server connection established');
        }
        catch (error) {
            this.logger.error('Failed to connect to MCP server', error);
            throw error;
        }
    }
    async disconnect() {
        this.client = null;
        this.serverUrl = null;
        this.logger.log('MCP client disconnected');
    }
    async listTools() {
        if (!this.client) {
            throw new Error('MCP client not connected');
        }
        try {
            const response = await this.client.get('/tools');
            return response.data.tools || [];
        }
        catch (error) {
            this.logger.error('Failed to list tools', error);
            throw error;
        }
    }
    async listResources() {
        if (!this.client) {
            throw new Error('MCP client not connected');
        }
        try {
            const response = await this.client.get('/resources');
            return response.data.resources || [];
        }
        catch (error) {
            this.logger.error('Failed to list resources', error);
            throw error;
        }
    }
    async listPrompts() {
        if (!this.client) {
            throw new Error('MCP client not connected');
        }
        try {
            const response = await this.client.get('/prompts');
            return response.data.prompts || [];
        }
        catch (error) {
            this.logger.error('Failed to list prompts', error);
            throw error;
        }
    }
    async callTool(toolName, arguments_) {
        if (!this.client) {
            throw new Error('MCP client not connected');
        }
        try {
            const response = await this.client.post('/tools/call', {
                name: toolName,
                arguments: arguments_,
            });
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to call tool ${toolName}`, error);
            throw error;
        }
    }
    async readResource(uri) {
        if (!this.client) {
            throw new Error('MCP client not connected');
        }
        try {
            const response = await this.client.post('/resources/read', {
                uri,
            });
            return response.data.content;
        }
        catch (error) {
            this.logger.error(`Failed to read resource ${uri}`, error);
            throw error;
        }
    }
    async getPrompt(promptName, arguments_) {
        if (!this.client) {
            throw new Error('MCP client not connected');
        }
        try {
            const response = await this.client.post('/prompts/get', {
                name: promptName,
                arguments: arguments_,
            });
            return response.data.prompt;
        }
        catch (error) {
            this.logger.error(`Failed to get prompt ${promptName}`, error);
            throw error;
        }
    }
    async sendNotification(message, type = 'info') {
        if (!this.client) {
            throw new Error('MCP client not connected');
        }
        try {
            await this.client.post('/notifications', {
                message,
                type,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            this.logger.error('Failed to send notification', error);
            throw error;
        }
    }
    async getServerInfo() {
        if (!this.client) {
            throw new Error('MCP client not connected');
        }
        try {
            const response = await this.client.get('/info');
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to get server info', error);
            throw error;
        }
    }
    isConnected() {
        return this.client !== null;
    }
    getServerUrl() {
        return this.serverUrl;
    }
};
exports.McpClient = McpClient;
exports.McpClient = McpClient = McpClient_1 = __decorate([
    (0, common_1.Injectable)()
], McpClient);
//# sourceMappingURL=mcp-client.service.js.map