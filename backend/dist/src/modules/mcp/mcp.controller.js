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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const mcp_service_1 = require("./mcp.service");
const mcp_client_service_1 = require("./mcp-client.service");
let McpController = class McpController {
    mcpService;
    mcpClient;
    constructor(mcpService, mcpClient) {
        this.mcpService = mcpService;
        this.mcpClient = mcpClient;
    }
    async getStatus() {
        const isAvailable = this.mcpService.isMcpAvailable();
        const serverUrl = this.mcpClient.getServerUrl();
        return {
            status: 'ok',
            available: isAvailable,
            serverUrl,
            connected: this.mcpClient.isConnected(),
        };
    }
    async getTools() {
        const tools = await this.mcpService.getAvailableTools();
        return {
            status: 'ok',
            tools,
        };
    }
    async getResources() {
        const resources = await this.mcpService.getAvailableResources();
        return {
            status: 'ok',
            resources,
        };
    }
    async getPrompts() {
        const prompts = await this.mcpService.getAvailablePrompts();
        return {
            status: 'ok',
            prompts,
        };
    }
    async callTool(toolName, body) {
        const result = await this.mcpService.callTool(toolName, body.arguments);
        return {
            status: 'ok',
            result,
        };
    }
    async readResource(body) {
        const content = await this.mcpService.readResource(body.uri);
        return {
            status: 'ok',
            content,
        };
    }
    async getPrompt(promptName, body) {
        const prompt = await this.mcpService.getPrompt(promptName, body.arguments);
        return {
            status: 'ok',
            prompt,
        };
    }
    async executeWorkflowStep(body) {
        const result = await this.mcpService.executeWorkflowStep(body.stepId, body.context);
        return {
            status: 'ok',
            result,
        };
    }
    async generateWorkflowCode(body) {
        const code = await this.mcpService.generateWorkflowCode(body.description, body.language);
        return {
            status: 'ok',
            code,
        };
    }
    async analyzeWorkflow(body) {
        const analysis = await this.mcpService.analyzeWorkflow(body.definition);
        return {
            status: 'ok',
            analysis,
        };
    }
    async validateWorkflow(body) {
        const validation = await this.mcpService.validateWorkflow(body.definition);
        return {
            status: 'ok',
            validation,
        };
    }
    async optimizeWorkflow(body) {
        const optimization = await this.mcpService.optimizeWorkflow(body.definition);
        return {
            status: 'ok',
            optimization,
        };
    }
    async generateDocumentation(body) {
        const documentation = await this.mcpService.generateDocumentation(body.definition);
        return {
            status: 'ok',
            documentation,
        };
    }
    async simulateWorkflow(body) {
        const simulation = await this.mcpService.simulateWorkflow(body.definition, body.inputs);
        return {
            status: 'ok',
            simulation,
        };
    }
};
exports.McpController = McpController;
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], McpController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('tools'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], McpController.prototype, "getTools", null);
__decorate([
    (0, common_1.Get)('resources'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], McpController.prototype, "getResources", null);
__decorate([
    (0, common_1.Get)('prompts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], McpController.prototype, "getPrompts", null);
__decorate([
    (0, common_1.Post)('tools/:toolName/call'),
    __param(0, (0, common_1.Param)('toolName')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], McpController.prototype, "callTool", null);
__decorate([
    (0, common_1.Post)('resources/read'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], McpController.prototype, "readResource", null);
__decorate([
    (0, common_1.Post)('prompts/:promptName'),
    __param(0, (0, common_1.Param)('promptName')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], McpController.prototype, "getPrompt", null);
__decorate([
    (0, common_1.Post)('workflows/execute-step'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], McpController.prototype, "executeWorkflowStep", null);
__decorate([
    (0, common_1.Post)('workflows/generate-code'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], McpController.prototype, "generateWorkflowCode", null);
__decorate([
    (0, common_1.Post)('workflows/analyze'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], McpController.prototype, "analyzeWorkflow", null);
__decorate([
    (0, common_1.Post)('workflows/validate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], McpController.prototype, "validateWorkflow", null);
__decorate([
    (0, common_1.Post)('workflows/optimize'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], McpController.prototype, "optimizeWorkflow", null);
__decorate([
    (0, common_1.Post)('workflows/documentation'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], McpController.prototype, "generateDocumentation", null);
__decorate([
    (0, common_1.Post)('workflows/simulate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], McpController.prototype, "simulateWorkflow", null);
exports.McpController = McpController = __decorate([
    (0, common_1.Controller)('api/mcp'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [mcp_service_1.McpService,
        mcp_client_service_1.McpClient])
], McpController);
//# sourceMappingURL=mcp.controller.js.map